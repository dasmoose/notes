var crypto = require('./crypto');
var fs = require('fs');
var ncp = require('ncp').ncp;
var path = require('path');
var prompt = require('prompt');
var walk = require('walk');

ncp.limit = 16;

module.exports = {

  /**
   * Copy given source directory to destination directory
   *
   * @param {String} source
   * @param {String} destination
   * @param {Function} sallback
   */
  copyDirectory: function(source, destination, callback) {
    ncp(source, destination, callback);
  },

  /**
  * Checks if a directory exists at a given path
  *
  * @param {String] path absolute or relative path to a directory
  * @return {Boolean} True if a directory exists at `path`, false otherwise.
  */
  directoryExists: function(path) {
    try {
      fs.readdirSync(path);
      return true;
    } catch(e) {
      return false;
    }
  },

  /**
  * Create directory
  *
  * @param {String] path absolute or relative path to create a directory
  * @throw {Error}
  */
  createDirectory: function(path) {
    fs.mkdirSync(path);
  },

  /**
   * Creates a file at the given path with the given contents
   *
   * @param {String} path The path which to create the file
   * @param {String} data The contents which to write to the file
   */
  createFile: function(path, data) {
    var rcPath = path.join(directory, config.scribe.rcfile);
    fs.openSync(rcPath, 'w');
  },

  /**
   * Discovers all non-dotfiles in the given directory
   *
   * `directory` needs to be expanded (e.g. '/home/USER/Downloads). readdirSync
   * does not like unexpanded paths (e.g. '~/Downloads')
   *
   * TODO make a recursive search through fs
   *
   * @param {String} directory
   * @return {Array} files in `directory`
   */
  getFiles: function(directory) {
    var files = fs.readdirSync(directory);
    return _.filter(files, function(file) {
      return file.indexOf('.') !== 0;
    });
  },

  /**
   * Reads the contents of a file at the given path
   *
   * @param {String} path
   * @return {String} file contents
   * @throw {Error}
   */
  getFile: function(path) {
    try {
      var file = fs.statSync(path);
      if (file.isFile()) {
        return fs.readFileSync(path, { flag: 'r' }).toString();
      } else {
        return '';
      }
    } catch(e) {
      console.log('error with getFile: file -> ' + path);
      throw e;
    }
  },

  /**
   * Decrypts and reads the contents of a file at the given path
   *
   * @param {String} path
   * @param {String} password
   * @return {String} file contents
   * @throw {Error}
   */
  getEncryptedFile: function(path, password) {
    try {
      var file = fs.statSync(path);
      if (file.isFile()) {
        var encrypted = fs.readFileSync(path, { flag: 'r'}).toString();
        return crypto.decrypt(encrypted, password);
      } else {
        return '';
      }
    } catch(e) {
      console.log('error with getEncryptedfile: file -> ' + path);
      throw e;
    }
  },

  /**
   * Prompts the user for password
   *
   * @param {Function} callback
   */
  promptForPassword: function(callback) {
    var schema = {
      properties: {
        password: {
          hidden: true
        }
      }
    };

    prompt.start();
    prompt.get(schema, callback);
  },

  /**
   * Save `data` to the given path
   *
   * NOTE: we have to specify the 'w' flag here, because writeFileSync default
   * to using append mode. Here we want to create if it does not exist, and
   * overwrite if it does.
   *
   * @param {String} data
   * @param {String} path
   */
  saveFile: function(data, path) {
    fs.writeFileSync(path, data, { flag: 'w' });
  },

  /**
   * Encrypt `data` and save the file to the given path
   *
   * NOTE: we have to specify the 'w' flag here, because writeFileSync default
   * to using append mode. Here we want to create if it does not exist, and
   * overwrite if it does.
   *
   * @param {String} data
   * @param {String} path
   * @param {String} password
   */
  saveEncryptedFile: function(data, path, password) {
    var encrypted = crypto.encrypt(data, password);
    fs.writeFileSync(path, encrypted, { flag: 'w' });
  },

  /**
   * Strips leading directory from `filePath`
   *
   * e.g. '/home/user/Documents/a.md' -> 'user/Documents/a.md'
   *
   * @param {String} filePath
   * @return {String}
   */
  stripLeadingDirectory: function(filePath) {
    // start at 1 to skip a potential leading '/'
    // also add 1 to indexOf to skip over the first non-leading '/'
    var index = filePath.indexOf('/', 1) + 1;
    return filePath.substring(index);
  },

  /**
   * Walk directory and discover files.
   *
   * @param {String} root root directory to start walking
   * @param {Function} fileCallback callback for each file
   * @param {Function} dirCallback callback for each directory
   * @param {Function} errorCallback callback for each error
   * @param {Function} doneCallback callback when walk is done
   */
  walk: function(root, fileCallback, dirCallback, errorCallback, doneCallback) {
    var walker = walk.walk(root, { followLinks: false });
    walker.on('file', fileCallback);
    walker.on('directory', dirCallback);
    walker.on('errors', errorCallback);
    walker.on('end', doneCallback);
  }

};
