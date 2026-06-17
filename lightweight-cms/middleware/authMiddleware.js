const tokenManager = require('../config/tokenConfig');
const db = require('../config/database'); // Pastikan import database di sini

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak, sertakan token jk-zeto' });
  }

  const token = authHeader.split(' ')[1]; // Mengambil string token murni

  // 1. CEK APAKAH TOKEN SUDAH DI-BLACKLIST (LOGOUT)
  db.get('SELECT token FROM token_blacklist WHERE token = ?', [token], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Jika token ditemukan di tabel blacklist, blokir akses segera!
    if (row) {
      return res.status(401).json({ message: 'Sesi telah berakhir (Anda telah logout). Silakan login kembali.' });
    }

    // 2. JIKA AMAN, LANJUTKAN VERIFIKASI DENGAN JK-ZETO
    try {
      const decodedPayload = tokenManager.verify(token);
      req.user = decodedPayload; 
      next(); // Izinkan admin mengakses fitur
    } catch (err) {
      return res.status(403).json({ message: 'Token ilegal, rusak, atau telah kedaluwarsa' });
    }
  });
};
