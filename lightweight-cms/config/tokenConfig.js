const { SecureToken } = require('jk-zeto');
require('dotenv').config();

const secretKey = process.env.CMS_SECRET_KEY;
if (!secretKey || secretKey.length !== 32) {
  console.error("ERROR: CMS_SECRET_KEY di file .env harus tepat 32 karakter!");
  process.exit(1);
}

// Membuat instance pelindung simetris berbasis enkripsi AES-256-GCM
const secureTokenManager = new SecureToken(secretKey);

module.exports = secureTokenManager;
