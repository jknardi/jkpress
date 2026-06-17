const db = require('../config/database');

// Ambil semua artikel untuk halaman publik dengan Pagination (Ringan & Cepat)
exports.getAllPosts = (req, res) => {
  // Ambil parameter dari URL query, beri nilai default jika tidak diisi
  const page = parseInt(req.query.page) || 1;    // Halaman saat ini (Default: 1)
  const limit = parseInt(req.query.limit) || 10; // Jumlah artikel per halaman (Default: 10)
  const offset = (page - 1) * limit;             // Titik potong baris data SQL

  // Kueri 1: Hitung total semua artikel di database untuk info navigasi frontend
  db.get('SELECT COUNT(*) as total FROM posts', [], (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalItems = countRow.total;
    const totalPages = Math.ceil(totalItems / limit);

    // Kueri 2: Ambil data artikel sesuai halaman dan batasan (LIMIT & OFFSET)
    const sql = 'SELECT id, title, slug, created_at FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    db.all(sql, [limit, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Kembalikan data lengkap beserta metadata navigasi halaman
      res.json({
        data: rows,
        pagination: {
          total_items: totalItems,
          total_pages: totalPages,
          current_page: page,
          per_page: limit,
          has_more: page < totalPages
        }
      });
    });
  });
};



// Ambil satu detail artikel utuh berdasarkan slug
// controllers/postController.js -> Ubah fungsi getPostBySlug Anda

exports.getPostBySlug = (req, res) => {
  // Tambah logika penambahan views secara otomatis saat artikel dibaca
  db.run('UPDATE posts SET views = views + 1 WHERE slug = ?', [req.params.slug]);

  db.get('SELECT * FROM posts WHERE slug = ? AND status = "published"', [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Artikel tidak ditemukan atau masih berupa draft' });

    // RAKIT SCHEMA MARKUP UNTUK GOOGLE & AI CRAWLER
    const googleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle", // Tipe artikel pers/berita
      "headline": row.seo_title || row.title,
      "description": row.seo_description || row.summary,
      "image": [row.featured_image || "https://url-default-anda.com"],
      "datePublished": row.created_at,
      "dateModified": row.updated_at,
      "author": {
        "@type": "Organization",
        "name": "JkPress Newsroom"
      }
    };

    // Jika artikel memiliki data koordinat Geo, masukkan ke skema Google
    if (row.geo_latitude && row.geo_longitude) {
      googleSchema.spatialCoverage = {
        "@type": "Place",
        "name": row.geo_location,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": row.geo_latitude,
          "longitude": row.geo_longitude
        }
      };
    }

    // Kembalikan data artikel + skema SEO otomatis
    res.json({
      article: row,
      seo_metadata: {
        title: row.seo_title || row.title,
        description: row.seo_description || row.summary,
        schema_json_ld: googleSchema // Frontend tinggal cetak ini di dalam tag <script> di HTML
      }
    });
  });
};


// Membuat artikel baru (Hanya bisa diakses admin yang lolos proteksi jk-zeto)
// controllers/postController.js -> Ubah fungsi createPost Anda
exports.createPost = (req, res) => {
  const { 
    title, content, summary, featured_image, 
    seo_title, seo_description, focus_keywords,
    geo_location, geo_latitude, geo_longitude, status 
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title dan content wajib diisi' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const postStatus = status || 'draft'; // Default disimpan sebagai draft jika tidak ditentukan

  const sql = `INSERT INTO posts (
    title, slug, content, summary, featured_image, 
    seo_title, seo_description, focus_keywords,
    geo_location, geo_latitude, geo_longitude, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    title, slug, content, summary, featured_image, 
    seo_title || title, seo_description || summary, focus_keywords,
    geo_location, geo_latitude, geo_longitude, postStatus
  ];

  db.run(sql, params, function(err) {
    if (err) return res.status(400).json({ error: 'Judul atau slug sudah pernah digunakan' });
    res.status(201).json({ message: 'Artikel berhasil disimpan', id: this.lastID, slug, status: postStatus });
  });
};




// --- FITUR UPDATE ARTIKEL (Hanya untuk Admin) ---
exports.updatePost = (req, res) => {
  const { id } = req.params; // Mengambil ID artikel dari URL
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title dan content wajib diisi' });
  }

  // Generate slug baru berdasarkan judul yang diubah
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const sql = 'UPDATE posts SET title = ?, slug = ?, content = ? WHERE id = ?';
  
  db.run(sql, [title, slug, content, id], function(err) {
    if (err) return res.status(400).json({ error: 'Gagal memperbarui, slug mungkin sudah digunakan' });
    
    // Jika tidak ada baris yang berubah, berarti ID artikel tidak ditemukan
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    res.json({ message: 'Artikel berhasil diperbarui', id, title, slug });
  });
};

// --- FITUR DELETE ARTIKEL (Hanya untuk Admin) ---
exports.deletePost = (req, res) => {
  const { id } = req.params; // Mengambil ID artikel dari URL

  db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' });
    }

    res.json({ message: 'Artikel berhasil dihapus', id });
  });
};
