import crypto from 'node:crypto';

export class RefreshTokenManager {
  static VERSION = 'v1.ref.';
  static ALGORITHM = 'aes-256-gcm';

  /**
   * EN: Initialize with a dedicated secret key for refresh tokens.
   * ID: Inisialisasi dengan kunci rahasia khusus untuk refresh token.
   * 
   * @param {string} secretKey - EN: Raw secret key string | ID: String kunci rahasia mentah.
   */
  constructor(secretKey) {
    if (!secretKey || typeof secretKey !== 'string') {
      throw new Error('EN: Secret key must be a valid string | ID: Secret key harus berupa string yang valid');
    }
    this.derivedKey = crypto.scryptSync(secretKey, 'salt-refresh-token-v1', 32);
  }

  /**
   * EN: Generate a secure Refresh Token embedded with a unique identifier and metadata.
   * ID: Membuat Refresh Token yang aman yang ditanamkan dengan pengenal unik dan metadata.
   * 
   * @param {Object} payload - EN: Essential data (e.g., { userId }) | ID: Data esensial (misal: { userId }).
   * @param {number} ttlInSeconds - EN: Time-to-live in seconds (default 7 days) | ID: Masa berlaku dalam detik (default 7 hari).
   * @returns {string} EN: Encrypted Refresh Token | ID: Refresh Token terenkripsi.
   */
  generate(payload, ttlInSeconds = 604800) {
    const iv = crypto.randomBytes(12);
    const expiry = Date.now() + (ttlInSeconds * 1000);
    
    // EN: Create a secure, unpredictable Opaque ID for token tracking/revocation
    // ID: Buat Opaque ID yang aman dan tidak dapat ditebak untuk pelacakan/pembatalan token
    const tokenId = crypto.randomBytes(24).toString('hex');
    
    const tokenData = JSON.stringify({ payload, tokenId, exp: expiry });
    
    const cipher = crypto.createCipheriv(RefreshTokenManager.ALGORITHM, this.derivedKey, iv);
    let encrypted = cipher.update(tokenData, 'utf8', 'base64url');
    encrypted += cipher.final('base64url');
    
    const authTag = cipher.getAuthTag().toString('base64url');

    return `${RefreshTokenManager.VERSION}${iv.toString('base64url')}.${encrypted}.${authTag}`;
  }

  /**
   * EN: Verify and decrypt the Refresh Token.
   * ID: Memverifikasi dan mendekripsi Refresh Token.
   * 
   * @param {string} token - EN: The refresh token from the client | ID: Refresh token dari klien.
   * @returns {Object} EN: Object containing payload and tokenId | ID: Objek berisi payload dan tokenId.
   */
  verify(token) {
    if (!token || typeof token !== 'string' || !token.startsWith(RefreshTokenManager.VERSION)) {
      throw new Error('EN: Invalid refresh token format | ID: Format refresh token tidak valid');
    }

    const parts = token.replace(RefreshTokenManager.VERSION, '').split('.');
    if (parts.length !== 3) {
      throw new Error('EN: Refresh token structure is corrupted | ID: Struktur refresh token rusak');
    }

    const [ivBuf, encryptedBuf, authTagBuf] = parts.map(part => Buffer.from(part, 'base64url'));

    try {
      const decipher = crypto.createDecipheriv(RefreshTokenManager.ALGORITHM, this.derivedKey, ivBuf);
      decipher.setAuthTag(authTagBuf);
      
      let decrypted = decipher.update(encryptedBuf, 'base64url', 'utf8');
      decrypted += decipher.final('utf8');
      
      const data = JSON.parse(decrypted);
      
      if (Date.now() > data.exp) {
        throw new Error('EN: Refresh token has expired | ID: Refresh token telah kedaluwarsa');
      }
      
      // EN: Returns payload and tokenId (tokenId is useful to check if the token was blacklisted)
      // ID: Mengembalikan payload dan tokenId (tokenId berguna untuk memeriksa apakah token telah diblacklist)
      return {
        payload: data.payload,
        tokenId: data.tokenId
      };
    } catch (err) {
      throw new Error(`EN: Refresh token verification failed: ${err.message} | ID: Verifikasi refresh token gagal: ${err.message}`);
    }
  }
}
