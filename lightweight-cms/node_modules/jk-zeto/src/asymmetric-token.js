import crypto from 'node:crypto';

export class AsymmetricToken {
  static VERSION = 'v1.asym.';

  /**
   * EN: Initialize with either a Private Key (for signing) or Public Key (for verification).
   * ID: Inisialisasi dengan Private Key (untuk menandai) atau Public Key (untuk verifikasi).
   * 
   * @param {string|Buffer} key - EN: PEM encoded key string or Buffer | ID: String kunci berformat PEM atau Buffer.
   */
  constructor(key) {
    if (!key) {
      throw new Error('EN: Key must be provided | ID: Kunci harus disediakan');
    }
    this.key = key;
  }

  /**
   * EN: Generate a signed token using a Private Key.
   * ID: Membuat token bertanda tangan digital menggunakan Private Key.
   * 
   * @param {Object} payload - EN: Data to be stored inside the token | ID: Data yang ingin disimpan di dalam token.
   * @param {number} ttlInSeconds - EN: Time-to-live in seconds (default 1 hour) | ID: Masa berlaku dalam detik (default 1 jam).
   * @returns {string} EN: Signed token string | ID: String token bertanda tangan.
   */
  generate(payload, ttlInSeconds = 3600) {
    const expiry = Date.now() + (ttlInSeconds * 1000);
    const tokenData = JSON.stringify({ payload, exp: expiry });
    
    // EN: Encode payload to base64url
    // ID: Mengubah payload menjadi format base64url
    const encodedPayload = Buffer.from(tokenData, 'utf8').toString('base64url');

    try {
      // EN: Create digital signature using Ed25519 private key
      // ID: Membuat tanda tangan digital menggunakan private key Ed25519
      const signature = crypto.sign(
        null, 
        Buffer.from(encodedPayload), 
        this.key
      );

      const encodedSignature = signature.toString('base64url');

      return `${AsymmetricToken.VERSION}${encodedPayload}.${encodedSignature}`;
    } catch (err) {
      throw new Error(`EN: Signing failed. Ensure you provided a valid Private Key. | ID: Penandatanganan gagal. Pastikan Anda memasukkan Private Key yang valid. Error: ${err.message}`);
    }
  }

  /**
   * EN: Verify and decode a signed token using a Public Key.
   * ID: Memverifikasi dan mendekripsi token menggunakan Public Key.
   * 
   * @param {string} token - EN: The token string from the client | ID: String token dari klien.
   * @returns {Object} EN: Original payload data | ID: Data payload asli.
   */
  verify(token) {
    if (!token || typeof token !== 'string' || !token.startsWith(AsymmetricToken.VERSION)) {
      throw new Error('EN: Invalid token format or version | ID: Format atau versi token tidak valid');
    }

    const parts = token.replace(AsymmetricToken.VERSION, '').split('.');
    if (parts.length !== 2) {
      throw new Error('EN: Invalid token structure | ID: Struktur token tidak valid');
    }

    const [encodedPayload, encodedSignature] = parts;

    try {
      const payloadBuffer = Buffer.from(encodedPayload);
      const signatureBuffer = Buffer.from(encodedSignature, 'base64url');

      // EN: Verify the digital signature using the public key
      // ID: Verifikasi tanda tangan digital menggunakan public key
      const isVerified = crypto.verify(
        null, 
        payloadBuffer, 
        this.key, 
        signatureBuffer
      );

      if (!isVerified) {
        throw new Error('EN: Signature verification failed | ID: Verifikasi tanda tangan gagal');
      }

      // === FIXED LINE / BAGIAN YANG DIPERBAIKI ===
      // EN: Convert the base64url payload buffer back to a raw UTF-8 JSON string before parsing
      // ID: Ubah kembali buffer payload base64url menjadi string JSON UTF-8 mentah sebelum di-parse
      const rawJsonString = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const decodedData = JSON.parse(rawJsonString);

      if (Date.now() > decodedData.exp) {
        throw new Error('EN: Token has expired | ID: Token telah kedaluwarsa');
      }

      return decodedData.payload;
    } catch (err) {
      throw new Error(`EN: Verification failed: ${err.message} | ID: Verifikasi gagal: ${err.message}`);
    }
  }
}
