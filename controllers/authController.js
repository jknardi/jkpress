const db = require('../config/database');
const bcrypt = require('bcryptjs');
const tokenManager = require('../config/tokenConfig');

// Registrasi Akun Admin Baru
exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Data tidak lengkap' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) return res.status(400).json({ message: 'Username sudah terdaftar' });
      res.status(201).json({ message: 'Registrasi admin berhasil', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Admin & Kirim Token jk-zeto
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ message: 'Username atau password salah' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Username atau password salah' });

    // Gunakan jk-zeto untuk mengunci data admin ke dalam string token (v1.sec)
    const payload = { id: user.id, username: user.username };
    const ttlSeconds = 7200; // Token kedaluwarsa otomatis dalam 2 jam

    try {
      const token = tokenManager.generate(payload, ttlSeconds);
      res.json({ message: 'Login berhasil', token });
    } catch (tokenErr) {
      res.status(500).json({ error: 'Gagal membuat enkripsi sesi proteksi' });
    }
  });
};


// --- FITUR LOGOUT ADMIN (Poin 3) ---
exports.logout = (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'Gagal logout, token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1]; // Mengambil string token murni

  // Masukkan token ke daftar hitam (blacklist) di database
  db.run('INSERT INTO token_blacklist (token) VALUES (?)', [token], (err) => {
    if (err) {
      // Jika error karena token sudah ada di database, artinya sudah pernah logout sebelumnya
      return res.status(400).json({ message: 'Sesi ini sudah di-logout sebelumnya' });
    }
    res.json({ message: 'Logout berhasil, sesi aman telah ditutup' });
  });
};
