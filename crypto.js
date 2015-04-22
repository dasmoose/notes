/**
 * This module implements a hash, encryption, and decryption methods.
 *
 * Specifically:
 * - hash: md5
 * - de/encryption: aes256
 *
 * TODO I want to eventually do some more research on these methods and find
 * more cryptographically secure methods.
 */

var crypto = require('crypto');

module.exports = {

  /**
   * Hashes the given `data` with the md5 algorithm
   *
   * @param {String} data
   * @return {String} hashed data
   */
  hash: function(data) {
    var md5Hash = crypto.createHash('md5');
    return md5Hash.update(data, 'utf8').digest('base64');
  },

  /**
   * Encrypts the given data with the given key
   *
   * @param {String} data
   * @param {String} key
   * @return {String} encrypted data
   */
  encrypt: function(data, key) {
    var encryptCipher = crypto.createCipher('aes256', key);
    return encryptCipher.update(data, 'utf8', 'hex') + 
        encryptCipher.final('hex');
  },

  /**
   * Decrypts the given data with the given key
   *
   * @param {String} data
   * @param {String} key
   * @return {String} decrypted data
   */
  decrypt: function(data, key) {
    var decryptCipher = crypto.createDecipher('aes256', key);
    return decryptCipher.update(data, 'hex', 'utf8') + 
        decryptCipher.final('utf8');
  }

};
