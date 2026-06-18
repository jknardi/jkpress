const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // 1. Tabel Pengguna / Admin
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // 2. Tabel Artikel (SEO, AI, Geo, dan Media Ready)
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    featured_image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    focus_keywords TEXT,
    geo_location TEXT,
    geo_latitude REAL,
    geo_longitude REAL,
    status TEXT DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 3. TABEL BARU: Kategori Artikel
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT
  )`);

  // 4. TABEL BARU: Penghubung Artikel dan Kategori (Relation Table)
  db.run(`CREATE TABLE IF NOT EXISTS post_categories (
    post_id INTEGER,
    category_id INTEGER,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )`);

  // 5. TABEL BARU: Sistem Komentar yang Ringan
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    status TEXT DEFAULT 'approved', -- 'approved', 'pending', 'spam'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )`);

  // 6. TABEL BARU: Log Analitik Bot AI & Search Engine Crawler (Kekinian!)
  db.run(`CREATE TABLE IF NOT EXISTS bot_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_name TEXT NOT NULL,          -- Contoh: 'GPTBot', 'Googlebot', 'PerplexityBot'
    accessed_url TEXT NOT NULL,
    ip_address TEXT,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 7. Tabel Sesi Token Blacklist (jk-zeto)
  db.run(`CREATE TABLE IF NOT EXISTS token_blacklist (
    token TEXT PRIMARY KEY,
    blacklisted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 8. Tabel Pengaturan Sistem Global
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`, () => {
    // Masukkan pengaturan default bawaan
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('active_theme', 'theme-magazine')`);
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('site_title', 'JkPress - CMS Super Cepat')`);
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('site_description', 'Platform pers modern masa kini')`);
  });
});

module.exports = db;
