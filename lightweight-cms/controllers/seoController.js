// controllers/seoController.js
const db = require('../config/database');
const { create } = require('xmlbuilder2');

// --- 1. GENERATE XML SITEMAP OTOMATIS ---
exports.getSitemap = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // Hanya ambil artikel yang sudah diterbitkan (published)
  const sql = 'SELECT slug, updated_at FROM posts WHERE status = "published" ORDER BY updated_at DESC';

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Inisialisasi struktur dasar XML Sitemap standar Google
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', { xmlns: 'http://sitemaps.org' });

    // Tambahkan URL halaman utama website Anda terlebih dahulu
    root.ele('url')
      .ele('loc').txt(`${baseUrl}/`).up()
      .ele('lastmod').txt(new Date().toISOString().split('T')[0]).up()
      .ele('changefreq').txt('daily').up()
      .ele('priority').txt('1.0').up();

    // Masukkan semua link artikel secara otomatis ke dalam sitemap
    rows.forEach(post => {
      // Mengonversi tanggal ke format YYYY-MM-DD
      const lastModDate = new Date(post.updated_at).toISOString().split('T')[0];

      root.ele('url')
        .ele('loc').txt(`${baseUrl}/posts/${post.slug}`).up()
        .ele('lastmod').txt(lastModDate).up()
        .ele('changefreq').txt('weekly').up()
        .ele('priority').txt('0.8').up();
    });

    // Ubah objek menjadi string XML murni
    const xmlString = root.end({ prettyPrint: true });

    // Wajib set Header content-type sebagai XML agar dibaca benar oleh Google & Browser
    res.header('Content-Type', 'application/xml');
    res.send(xmlString);
  });
};

// --- 2. GENERATE RSS FEED OTOMATIS (Sangat Disukai Mesin AI) ---
exports.getRSSFeed = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // Ambil 20 artikel terbaru untuk disajikan ke pembaca RSS / Bot AI
  const sql = 'SELECT title, slug, summary, content, created_at FROM posts WHERE status = "published" ORDER BY created_at DESC LIMIT 20';

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Inisialisasi struktur dasar RSS 2.0
    const feed = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('rss', { version: '2.0', 'xmlns:atom': 'http://w3.org' })
        .ele('channel')
          .ele('title').txt('JkPress Newsroom').up()
          .ele('link').txt(`${baseUrl}/`).up()
          .ele('description').txt('Platform pers dan konten blog modern masa kini bertenaga Node.js').up()
          .ele('language').txt('id-id').up()
          .ele('lastBuildDate').txt(new Date().toUTCString()).up();

    // Masukkan data artikel ke dalam item RSS
    rows.forEach(post => {
      feed.ele('item')
        .ele('title').txt(post.title).up()
        .ele('link').txt(`${baseUrl}/posts/${post.slug}`).up()
        .ele('guid', { isPermaLink: 'true' }).txt(`${baseUrl}/posts/${post.slug}`).up()
        .ele('pubDate').txt(new Date(post.created_at).toUTCString()).up()
        .ele('description').txt(post.summary || '').up() // AI mengambil poin penting dari sini
        .ele('content:encoded').txt(post.content).up();  // Bot membaca artikel utuh dari sini
    });

    const xmlString = feed.end({ prettyPrint: true });

    // Set Header content-type sebagai XML / RSS
    res.header('Content-Type', 'application/rss+xml');
    res.send(xmlString);
  });
};
