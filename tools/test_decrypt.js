#!/usr/bin/env node
// Test decrypt strategia - weryfikacja że Python encryption jest kompatybilna z CryptoJS decryption
const CryptoJS = require('../assets/js/lib/crypto-js.min.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'strategia_encrypted.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const password = process.argv[2];

if (!password) {
  console.error('Użycie: node test_decrypt.js <haslo>');
  process.exit(1);
}

const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Utf8.parse(data.salt_string), {
  keySize: 256 / 32,
  iterations: data.kdf_iterations,
  hasher: CryptoJS.algo.SHA1
});

const decrypted = CryptoJS.AES.decrypt(data.ciphertext, key, {
  iv: CryptoJS.enc.Base64.parse(data.iv),
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
});

const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
if (plaintext && plaintext.length > 50) {
  console.log('✓ Decrypt OK (' + plaintext.length + ' znaków)');
  console.log('Pierwsze 200 znaków:');
  console.log(plaintext.slice(0, 200));
  process.exit(0);
} else {
  console.error('✗ Decrypt FAIL - pusty wynik lub za krótki');
  process.exit(1);
}
