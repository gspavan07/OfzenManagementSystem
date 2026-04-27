const CryptoJS = require('crypto-js');

const KEY = process.env.MAIL_ENCRYPTION_KEY;

/**
 * Encrypt a plaintext string using AES-256.
 * @param {string} plainText
 * @returns {string} encrypted ciphertext string
 */
const encrypt = (plainText) => {
  if (!KEY) throw new Error('MAIL_ENCRYPTION_KEY is not set in environment');
  return CryptoJS.AES.encrypt(plainText, KEY).toString();
};

/**
 * Decrypt an AES-256 ciphertext string.
 * @param {string} cipherText
 * @returns {string} original plaintext
 */
const decrypt = (cipherText) => {
  if (!KEY) throw new Error('MAIL_ENCRYPTION_KEY is not set in environment');
  const bytes = CryptoJS.AES.decrypt(cipherText, KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
