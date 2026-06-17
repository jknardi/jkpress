const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // 1. Tabel Admin
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // 2. Tabel Artikel (Diperbarui untuk SEO, AI, Geo, dan Media)
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,                  -- Ringkasan pendek (Sangat disukai AI untuk ekstraksi cepat)
    featured_image TEXT,           -- URL Gambar Utama/Thumbnail
    
    -- Kolom Khusus SEO & Google
    seo_title TEXT,                -- Meta Title khusus search engine
    seo_description TEXT,          -- Meta Description untuk snippet Google
    focus_keywords TEXT,           -- Kata kunci utama untuk analisis konten
    
    -- Kolom Khusus Geo-Targeting (Berita Lokal / Pres)
    geo_location TEXT,             -- Nama tempat/kota (contoh: "Jakarta, Indonesia")
    geo_latitude REAL,             -- Koordinat lintang untuk Google Maps Schema
    geo_longitude REAL,            -- Koordinat bujur
    
    status TEXT DEFAULT 'draft',   -- 'published' atau 'draft'
    views INTEGER DEFAULT 0,       -- Statistik total tayangan artikel
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 3. Tabel Token Blacklist (jk-zeto)
  db.run(`CREATE TABLE IF NOT EXISTS token_blacklist (
    token TEXT PRIMARY KEY,
    blacklisted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 4. Tabel Pengaturan Sistem (Untuk Tema & SEO Global)
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`, () => {
    // Masukkan pengaturan default jika tabel baru dibuat
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('active_theme', 'tema-default')`);
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('site_title', 'JkPress - CMS Super Cepat')`);
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('site_description', 'Platform pers modern masa kini')`);
  });
});

module.exports = db;
