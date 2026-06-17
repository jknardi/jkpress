# jk-zeto 🛡️

**Zero-dependency, high-performance secure token library for Node.js using native crypto.**  
*Pustaka token aman berkinerja tinggi tanpa dependensi pihak ketiga untuk Node.js menggunakan modul kriptografi bawaan.*

---

## 🌐 Language / Bahasa
* [English (#-english)](#-english)
* [Bahasa Indonesia (#-bahasa-indonesia)](#-bahasa-indonesia)

---

## 🇬🇧 English

### 🚀 Overview
`jk-zeto` is a lightweight, ultra-secure alternative to JSON Web Tokens (JWT). Built entirely on Node.js native `crypto` module, it eliminates supply-chain vulnerabilities (zero-dependency) while providing maximum execution speed. 

Unlike standard JWTs which are only base64-encoded and prone to algorithm manipulation attacks, `jk-zeto` enforces strict algorithm versioning and offers full payload encryption.

### ✨ Key Features
* **Zero Dependencies:** Zero risk of npm supply-chain vulnerabilities.
* **Symmetric Token (`SecureToken`):** Uses **AES-256-GCM** authenticated encryption. Payload is completely hidden and tamper-proof.
* **Asymmetric Token (`AsymmetricToken`):** Uses **Ed25519** (Edwards-curve Digital Signature Algorithm) for ultra-fast, short-signature microservices authentication.
* **No Dynamic Headers:** Immune to "alg: none" attacks by hardcoding cryptographic primitives per version.
* **Built-in Key Generator:** Create military-grade Ed25519 PEM keys instantly via CLI.

---

### 📦 Installation
Since this library is open-source, you can link it locally or install it directly via GitHub (or npm once published):
```bash
npm install github:jknardi/jk-zeto
```

---

### 💻 Usage Guide

#### 1. Symmetric Encryption (AES-256-GCM)
Best for single-server architectures where the same secret key issues and verifies tokens. Payload is fully encrypted.

```javascript
import { SecureToken } from 'jk-zeto';

const tokenManager = new SecureToken('your-super-safe-secret-key');

// Generate Token (Payload, TTL in seconds)
const token = tokenManager.generate({ userId: 'usr_99', role: 'admin' }, 3600);
console.log('Generated Token:', token); 
// Output format: v1.sec.[iv].[encryptedPayload].[authTag]

// Verify and Decode Token
try {
  const payload = tokenManager.verify(token);
  console.log('Decrypted Payload:', payload);
} catch (error) {
  console.error('Verification failed:', error.message);
}
```

#### 2. Asymmetric Signatures (Ed25519)
Best for Microservices. Authentication server signs with a Private Key, other microservices verify with a Public Key.

First, generate your Ed25519 key pair using the built-in CLI:
```bash
npm run keygen
```

Implementation in code:
```javascript
import { AsymmetricToken } from 'jk-zeto';

// Server A: Authorization Server (Signs with Private Key)
const signer = new AsymmetricToken(process.env.PRIVATE_KEY_PEM);
const token = signer.generate({ scope: 'read:profile' }, 1800);

// Server B: Microservice Resource Server (Verifies with Public Key)
const verifier = new AsymmetricToken(process.env.PUBLIC_KEY_PEM);
try {
  const payload = verifier.verify(token);
  console.log('Verified Scope:', payload);
} catch (error) {
  console.error('Invalid Signature:', error.message);
}
```

---

### 🧪 Automated Testing
Run the built-in native Node.js test runner:
```bash
npm test
```

---

## 🇮🇩 Bahasa Indonesia

### 🚀 Tinjauan
`jk-zeto` adalah alternatif pengganti JSON Web Token (JWT) yang sangat ringan dan aman. Dibuat murni menggunakan modul `crypto` bawaan Node.js, pustaka ini menghilangkan risiko celah keamanan dari pustaka pihak ketiga (tanpa dependensi) sekaligus memberikan kecepatan eksekusi maksimal.

Berbeda dengan JWT standar yang datanya hanya di-encode dengan base64 dan rentan terhadap manipulasi algoritma (*algorithm attacks*), `jk-zeto` mengunci versi algoritma secara kaku dan menyediakan enkripsi data penuh.

### ✨ Fitur Utama
* **Tanpa Dependensi (Zero Dependency):** Bebas dari risiko eksploitasi rantai pasokan kode (*supply-chain vulnerability*).
* **Token Simetris (`SecureToken`):** Menggunakan enkripsi terotentikasi **AES-256-GCM**. Isi data tersembunyi sepenuhnya dan anti-manipulasi.
* **Token Asimetris (`AsymmetricToken`):** Menggunakan algoritma **Ed25519** untuk autentikasi *microservices* yang sangat cepat dengan ukuran tanda tangan yang ringkas.
* **Tanpa Header Dinamis:** Kebal terhadap serangan "alg: none" karena algoritma dikunci mati di dalam sistem berdasarkan versi.
* **Utilitas Pembuat Kunci Bawaan:** Buat pasangan kunci Ed25519 berstandar militer secara instan via terminal.

---

### 📦 Cara Instalasi
Karena pustaka ini bersifat open-source, Anda dapat memasangnya langsung dari GitHub:
```bash
npm install github:jknardi/jk-zeto
```

---

### 💻 Panduan Penggunaan

#### 1. Enkripsi Simetris (AES-256-GCM)
Sangat cocok untuk arsitektur server tunggal di mana kunci rahasia yang sama digunakan untuk membuat dan memeriksa token. Data di dalam token terenkripsi total.

```javascript
import { SecureToken } from 'jk-zeto';

const tokenManager = new SecureToken('kunci-rahasia-super-aman-anda');

// Membuat Token (Payload, Masa Berlaku dalam detik)
const token = tokenManager.generate({ userId: 'usr_99', role: 'admin' }, 3600);
console.log('Token Terbentuk:', token); 
// Format output: v1.sec.[iv].[encryptedPayload].[authTag]

// Memverifikasi dan Mendekripsi Token
try {
  const payload = tokenManager.verify(token);
  console.log('Payload Hasil Dekripsi:', payload);
} catch (error) {
  console.error('Verifikasi gagal:', error.message);
}
```

#### 2. Tanda Tangan Asimetris (Ed25519)
Sangat cocok untuk arsitektur *Microservices*. Server Otentikasi menandai token dengan *Private Key*, server layanan lainnya cukup memverifikasi dengan *Public Key*.

Pertama, buat pasangan kunci Ed25519 Anda menggunakan perintah CLI bawaan:
```bash
npm run keygen
```

Implementasi di dalam kode:
```javascript
import { AsymmetricToken } from 'jk-zeto';

// Server A: Server Otentikasi (Menandai dengan Private Key)
const signer = new AsymmetricToken(process.env.PRIVATE_KEY_PEM);
const token = signer.generate({ scope: 'read:profile' }, 1800);

// Server B: Server Microservice (Memverifikasi dengan Public Key)
const verifier = new AsymmetricToken(process.env.PUBLIC_KEY_PEM);
try {
  const payload = verifier.verify(token);
  console.log('Hak Akses Terverifikasi:', payload);
} catch (error) {
  console.error('Tanda Tangan Tidak Sah:', error.message);
}
```

---

### 🧪 Pengujian Otomatis
Jalankan pengujian unit bawaan menggunakan *test runner* asli Node.js:
```bash
npm test
```

---

## 📄 License / Lisensi
This project is licensed under the **MIT License** - see the LICENSE file for details.  
*Proyek ini dilisensikan di bawah **MIT License**.*
