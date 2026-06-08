const crypto = require('crypto');

class CryptoService {
  /**
   * Generates a secure, non-predictable cryptographically strong numeric OTP
   */
  generateNumericOtp(length = 6) {
    // Beginner Mistake: Math.random(). Industry Standard: crypto.randomInt
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hashes the secure single-use secrets before database ingestion (SHA-256)
   */
  hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = new CryptoService();