// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// 1. Pengaturan Tempat dan Nama File
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Gambar disimpan ke folder uploads/
  },
  filename: (req, file, cb) => {
    // Mengubah nama file menjadi unik: tanggal-acak.ekstensi (contoh: 1718610000-4829.jpg)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Filter Tipe File (Hanya Gambar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan! (jpg, jpeg, png, webp)'));
  }
};

// 3. Inisialisasi Multer dengan Batasan Ukuran 2 MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 Megabytes
});

module.exports = upload;
