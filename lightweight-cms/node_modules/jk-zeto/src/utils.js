#!/usr/bin/env node

import crypto from 'node:crypto';

/**
 * EN: Generates a high-security Ed25519 key pair in PEM format.
 * ID: Menghasilkan pasangan kunci Ed25519 berkeamanan tinggi dalam format PEM.
 * 
 * @returns {Object} EN: { privateKey, publicKey } | ID: { privateKey, publicKey }
 */
export function generateKeyPair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519', {
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    },
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    }
  });

  return { privateKey, publicKey };
}

// ============================================================================
// CLI RUNNER SECTION / BAGIAN EKSEKUSI CLI
// ============================================================================
// EN: Check if this file is run directly via terminal (e.g., node src/utils.js)
// ID: Periksa apakah file ini dijalankan langsung via terminal
if (process.argv[1] && (process.argv[1].endsWith('utils.js') || process.argv[1].endsWith('utils'))) {
  try {
    console.log('⏳ EN: Generating secure Ed25519 key pair... | ID: Menghasilkan pasangan kunci Ed25519 yang aman...\n');
    
    const { privateKey, publicKey } = generateKeyPair();

    console.log('======================================================================');
    console.log('🔑 PRIVATE KEY (EN: Keep it secret! / ID: Jaga tetap rahasia!)');
    console.log('======================================================================');
    console.log(privateKey);

    console.log('======================================================================');
    console.log('🔓 PUBLIC KEY (EN: Share it with your microservices / ID: Bagikan ke microservices)');
    console.log('======================================================================');
    console.log(publicKey);
    
    console.log('✅ EN: Keys generated successfully! | ID: Kunci berhasil dibuat!');
  } catch (error) {
    console.error('❌ EN: Failed to generate keys: | ID: Gagal menghasilkan kunci:', error.message);
  }
}
