#!/usr/bin/env node

var _ = require('underscore');
var app = require('./package.json');
var opts = require('commander');
var path = require('path');
var utils = require('./utils');

// globals for keeping track of walked files/dirs
var dirs = [];
var files = [];

// There are only two options: encrypt, and decrypt.
//
// Note:
// e.g. .option('FLAG, EXPANDED_FLAG|OPTION_NAME', 'DEFAULT|DESCRIPTION')
opts
  .version( app.version )
  .usage('[options]')
  .option('-e, --encrypt', 'the option to encrypt files')
  .option('-d, --decrypt', 'the option to decrypt files')
  .parse(process.argv);

// ensure notes, encrypted, and tmp directories exist
if (!utils.directoryExists('./notes')) {
  utils.createDirectory('./notes');
}
if (!utils.directoryExists('./encrypted')) {
  utils.createDirectory('./encrypted');
}
if (!utils.directoryExists('/tmp/notes')) {
  utils.createDirectory('/tmp/notes');
}
if (!utils.directoryExists('/tmp/encrypted')) {
  utils.createDirectory('/tmp/encrypted');
}

/**
 * Creates a file based on given parameters
 *
 * @param {String} root
 * @param {Object} stat
 * @param {function} next
 */
var walkFileCallback = function(root, stat, next) {
  var filePath = path.join(root, stat.name);
  files.push(filePath);
  next();
};

/**
 * Creates a directory based on given parameters
 *
 * @param {String} root
 * @param {Object} stat
 * @param {function} next
 */
var walkDirCallback = function(root, stat, next) {
  var dirPath = path.join(root, stat.name);
  dirs.push(dirPath);
  next();
};

/**
 * Reports error and exits
 *
 * @param {String} root
 * @param {Object} stats
 * @param {function} next
 */
var walkErrorCallback = function(root, stats, next) {
  console.log('walk error!');
  process.exit(1);
  // next();
};

if (opts.encrypt) {

  // locally backup encrypted dir before we try to encrypt
  utils.copyDirectory('./encrypted', '/tmp/encrypted', function(err) {
    // catch any copying error
    if (err) {
      console.log('error creating local backup!');
      process.exit(1);
    }

    utils.promptForPassword(function(err, result) {
      if (err) {
        console.log('problem with password prompt');
      }

      // walk notes dir
      utils.walk('./notes', walkFileCallback, walkDirCallback, 
          walkErrorCallback, function doneCallback() {
        // create dirs
        _.each(dirs, function(dir) {
          var destination =
              path.join('./encrypted', utils.stripLeadingDirectory(dir));
          try {
            utils.createDirectory(destination);
          } catch(e) {
            if (e.code !== 'EEXIST') {
              process.exit(1);
            }
          }
        });

        // read note files, encrypt them, and save them in the destination dir
        _.each(files, function(file) {
          var destination =
              path.join('./encrypted', utils.stripLeadingDirectory(file));
          var data = utils.getFile(file);
          utils.saveEncryptedFile(data, destination, result.password);
        });
      });

    });

  });
} else if (opts.decrypt) {

  // locally backup notes dir before we try to decrypt
  utils.copyDirectory('./notes', '/tmp/notes', function(err) {
    if (err) {
      console.log('error creating local backup!');
      process.exit(1);
    }

    utils.promptForPassword(function(err, result) {
      if (err) {
        console.log('problem with password prompt');
      }

      // walk encrypted dir
      utils.walk('./encrypted', walkFileCallback, walkDirCallback, 
          walkErrorCallback, function doneCallback() {
        // create dirs
        _.each(dirs, function(dir) {
          var destination =
              path.join('./notes', utils.stripLeadingDirectory(dir));
          try {
            utils.createDirectory(destination);
          } catch(e) {
            // if the directory exists, skip over the error. Otherwise exit.
            if (e.code !== 'EEXIST') {
              process.exit(1);
            }
          }
        });

        // read note files, decrypt them, and save them in the destination dir
        _.each(files, function(file) {
          var destination =
              path.join('./notes', utils.stripLeadingDirectory(file));
          var data = utils.getEncryptedFile(file, result.password);
          utils.saveFile(data, destination);
        });

      });

    });

  });

} else {
  // report error
  console.log('error, no option chosen');
}
