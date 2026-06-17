import crypto from 'node:crypto';

export class SecureToken {
  static ALGORITHM = 'aes-256-gcm';
  static VERSION = 'v1.sec.';

  /**
   * Creates a new SecureToken instance.
   * Membuat instance SecureToken baru.
   *
   * @param {string} secretKey
   * Raw secret key. Any length is allowed because it will be
   * cryptographically derived into a secure 32-byte key.
   *
   * Kunci rahasia mentah. Panjang bebas karena akan
   * diturunkan (derived) menjadi kunci 32-byte yang aman secara kriptografi.
   */
  constructor(secretKey) {
    if (!secretKey || typeof secretKey !== 'string') {
      throw new Error(
        'Secret key must be a valid string / Secret key harus berupa string yang valid'
      );
    }

    // Derive a secure 32-byte encryption key from the raw secret.
    // Menghasilkan kunci enkripsi 32-byte yang aman dari secret mentah.
    this.derivedKey = crypto.scryptSync(
      secretKey,
      'salt-secure-token-v1',
      32
    );
  }

  /**
   * Generates an encrypted token from a payload.
   * Membuat token terenkripsi dari sebuah payload.
   *
   * @param {Object} payload
   * Data to be stored inside the token.
   * Data yang akan disimpan di dalam token.
   *
   * @param {number} [ttlInSeconds=3600]
   * Token lifetime in seconds (default: 1 hour).
   * Masa berlaku token dalam detik (default: 1 jam).
   *
   * @returns {string}
   * Token format:
   * v1.sec.[iv].[encryptedPayload].[authTag]
   */
  generate(payload, ttlInSeconds = 3600) {
    // AES-GCM requires a 12-byte IV for optimal security.
    // AES-GCM membutuhkan IV 12-byte untuk keamanan optimal.
    const iv = crypto.randomBytes(12);

    // Calculate token expiration timestamp.
    // Hitung waktu kedaluwarsa token.
    const expiry = Date.now() + (ttlInSeconds * 1000);

    const tokenData = JSON.stringify({
      payload,
      exp: expiry
    });

    const cipher = crypto.createCipheriv(
      SecureToken.ALGORITHM,
      this.derivedKey,
      iv
    );

    let encrypted = cipher.update(
      tokenData,
      'utf8',
      'base64url'
    );

    encrypted += cipher.final('base64url');

    // Authentication tag used to verify integrity and authenticity.
    // Authentication tag digunakan untuk memverifikasi integritas dan keaslian data.
    const authTag = cipher.getAuthTag().toString('base64url');

    return `${SecureToken.VERSION}${iv.toString('base64url')}.${encrypted}.${authTag}`;
  }

  /**
   * Verifies and decrypts a token back into its original payload.
   * Memverifikasi dan mendekripsi token kembali ke payload aslinya.
   *
   * @param {string} token
   * Token received from the client.
   * Token yang diterima dari client.
   *
   * @returns {Object}
   * Original payload.
   * Payload asli.
   *
   * @throws {Error}
   * Throws an error if:
   * - Token format is invalid
   * - Token has expired
   * - Token was modified
   * - Wrong secret key is used
   *
   * Akan melempar error jika:
   * - Format token tidak valid
   * - Token sudah kedaluwarsa
   * - Token telah dimodifikasi
   * - Secret key yang digunakan salah
   */
  verify(token) {
    if (
      !token ||
      typeof token !== 'string' ||
      !token.startsWith(SecureToken.VERSION)
    ) {
      throw new Error(
        'Invalid token format or version / Format atau versi token tidak valid'
      );
    }

    const parts = token
      .replace(SecureToken.VERSION, '')
      .split('.');

    if (parts.length !== 3) {
      throw new Error(
        'Corrupted or incomplete token structure / Struktur token rusak atau tidak lengkap'
      );
    }

    const [ivBuf, encryptedBuf, authTagBuf] = parts.map(
      part => Buffer.from(part, 'base64url')
    );

    try {
      const decipher = crypto.createDecipheriv(
        SecureToken.ALGORITHM,
        this.derivedKey,
        ivBuf
      );

      decipher.setAuthTag(authTagBuf);

      let decrypted = decipher.update(
        encryptedBuf,
        'base64url',
        'utf8'
      );

      decrypted += decipher.final('utf8');

      const data = JSON.parse(decrypted);

      // Check token expiration.
      // Periksa apakah token sudah kedaluwarsa.
      if (Date.now() > data.exp) {
        throw new Error(
          'Token expired / Token telah kedaluwarsa'
        );
      }

      return data.payload;
    } catch (err) {
      throw new Error(
        'Verification failed: token was modified or secret key is incorrect / Verifikasi gagal: token telah dimodifikasi atau secret key salah'
      );
    }
  }
}