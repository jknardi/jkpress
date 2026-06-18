const express = require('express');
const path = require('path');

const db = require('./config/database'); 

const multer = require('multer');
const cors = require('cors'); // Mengaktifkan modul CORS
const rateLimit = require('express-rate-limit'); // Mengaktifkan modul Rate Limit

const seoController = require('./controllers/seoController');
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const authMiddleware = require('./middleware/authMiddleware');
const uploadMiddleware = require('./middleware/uploadMiddleware');
require('dotenv').config();



const app = express();



// ==========================================
// CONFIGURASI MESIN TEMA DINAMIS (EJS)
// ==========================================
app.set('view engine', 'ejs');

// Middleware untuk mendeteksi tema aktif dari database di setiap request halaman publik
app.use((req, res, next) => {
  db.get("SELECT value FROM settings WHERE key = 'active_theme'", [], (err, row) => {
    const activeTheme = (row && row.value) ? row.value : 'tema-default';
    
    // Set folder views Express secara dinamis ke folder tema yang aktif
    app.set('views', path.join(__dirname, 'themes', activeTheme));
    
    // Simpan info tema aktif ke objek res.locals agar bisa diakses di route mana saja
    res.locals.activeTheme = activeTheme;
    next();
  });
});

// Menyediakan akses file statis (CSS/JS) milik masing-masing tema secara dinamis
app.use('/assets', (req, res, next) => {
  // res.locals.activeTheme didapat dari middleware deteksi tema di atasnya
  const themePublicPath = path.join(__dirname, 'themes', res.locals.activeTheme, 'public');
  express.static(themePublicPath)(req, res, next);
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());



// ==========================================
// CONFIGURASI KEAMANAN GLOBAL (WAJIB DI ATAS)
// ==========================================

// 1. Penerapan CORS (Poin 2)
// Mengizinkan frontend (misal React/Vue/Next.js) mengakses API backend tanpa diblokir browser
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Masukkan alamat URL frontend Anda nanti
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pembaca format JSON dari client
app.use(express.json());

// 2. Penerapan Rate Limiter Khusus Login Admin (Poin 1)
// Membatasi IP yang sama agar tidak bisa menembak login terus-menerus
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Jangka waktu: 15 menit
  max: 5, // Maksimal 5 kali percobaan login dari IP yang sama
  message: { 
    message: 'Terlalu banyak percobaan login gila-gilaan. Sila tunggu 15 menit lagi.' 
  },
  standardHeaders: true, // Kembalikan info rate limit di header `RateLimit-*`
  legacyHeaders: false, // Matikan header `X-RateLimit-*` yang sudah usang
});


// ==========================================
// JALUR RUTE API (ROUTES)
// ==========================================

app.use('/assets/theme-magazine', express.static(path.join(__dirname, 'themes', 'theme-magazine', 'public')));

// Akses Folder Media Publik
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute Autentikasi (Route login dipasang pembatas loginLimiter)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', loginLimiter, authController.login); 
app.post('/api/auth/logout', authMiddleware, authController.logout); // RUTE BARU: Logout



// ==========================================
// PERUBAHAN RUTE PUBLIK: MERENDER TAMPILAN WEB (EJS)
// ==========================================

// 1. Tampilan Halaman Beranda (Daftar Artikel)
app.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6; // Tampilkan 6 artikel kekinian berbentuk grid di frontend
  const offset = (page - 1) * limit;

  db.all('SELECT id, title, slug, summary, featured_image, created_at FROM posts WHERE status = "published" ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset], (err, posts) => {
    db.get('SELECT COUNT(*) as total FROM posts WHERE status = "published"', [], (err, countRow) => {
      const totalPages = Math.ceil(countRow.total / limit);
      
      // Mengirimkan data langsung ke file index.ejs di folder tema aktif
      res.render('index', { 
        posts, 
        currentPage: page, 
        totalPages,
        siteTitle: 'JkPress News',
        siteDesc: 'Platform berita pers super cepat masa kini.'
      });
    });
  });
});

// 2. Tampilan Halaman Detail Artikel (Single Post)
app.get('/posts/:slug', (req, res) => {
  // Tambah views otomatis
  db.run('UPDATE posts SET views = views + 1 WHERE slug = ?', [req.params.slug]);

  db.get('SELECT * FROM posts WHERE slug = ? AND status = "published"', [req.params.slug], (err, post) => {
    if (!post) return res.status(404).send('Artikel tidak ditemukan');

    // Integrasi Otomatis Skema JSON-LD untuk AI & Google agar AMAN & Terpusat
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": post.seo_title || post.title,
      "description": post.seo_description || post.summary,
      "image": [post.featured_image || "/uploads/default.jpg"],
      "datePublished": post.created_at,
      "author": { "@type": "Organization", "name": "JkPress Team" }
    };

    // Kirim data artikel dan meta-data keamanan ke file single.ejs
    res.render('single', { 
      post, 
      schemaJson: JSON.stringify(schemaMarkup) 
    });
  });
});


// Rute Publik Konten
app.get('/api/posts', postController.getAllPosts);
app.get('/api/posts/:slug', postController.getPostBySlug);

// RUTE BARU KHUSUS GOOGLE & AI CRAWLER
app.get('/sitemap.xml', seoController.getSitemap);
app.get('/feed.xml', seoController.getRSSFeed);

// Rute Admin (Wajib membawa Token jk-zeto)
app.post('/api/admin/posts', authMiddleware, postController.createPost);
app.put('/api/admin/posts/:id', authMiddleware, postController.updatePost);
app.delete('/api/admin/posts/:id', authMiddleware, postController.deletePost);
app.post('/api/admin/upload', authMiddleware, uploadMiddleware.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Gagal mengunggah gambar' });
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ message: 'Gambar berhasil diunggah', filename: req.file.filename, url: imageUrl });
});

// Penanganan Error Multer & Global
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file terlalu besar! Maksimal 2 MB.' });
  }
  if (err) return res.status(400).json({ message: err.message });
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`CMS Ringan Berhasil Jalan di http://localhost:${PORT}`);
  console.log(`Proteksi: jk-zeto + Rate Limiter + CORS Aktif`);
  console.log(`=================================================`);
});
