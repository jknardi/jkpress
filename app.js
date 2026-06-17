const express = require('express');
const path = require('path');
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

// Akses Folder Media Publik
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute Autentikasi (Route login dipasang pembatas loginLimiter)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', loginLimiter, authController.login); 
app.post('/api/auth/logout', authMiddleware, authController.logout); // RUTE BARU: Logout

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
