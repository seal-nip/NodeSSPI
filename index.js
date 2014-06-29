var fs = require('fs'),
  path = require('path');
var binding;

// Look for binary for this platform
var modPath = path.join(__dirname, 'bin', process.platform + '-' + process.arch, 'nodeSSPI');
try {
  fs.statSync(modPath + '.node');
  binding = require(modPath);
} catch (ex) {
  binding = require('bindings')('nodeSSPI');
}

/*
  opts:{
    offerSSPI: true|false,
    offerBasic: true|false,
    basicPreferred: false|true,
    authoritative: true|false,
    usernameCase: 'lower'|'upper',
    perRequestAuth: false|true,
    domain: <string>, // used by basic authentication
    omitDomain: false|true,
  }
*/
function main(opts) {
  opts = opts || {};
  // defaults
  var defaultOpts = {
    offerSSPI: true,
    offerBasic: true,
    basicPreferred: false,
    authoritative: true,
    omitDomain: false,
    usernameCase: 'lower',
    perRequestAuth: false
  };
  opts.__proto__ = defaultOpts;
  this.opts = opts;
}

main.prototype.authenticate = function (req, res, next) {
  if (this.opts.perRequestAuth) {
    delete req.connection.user;
  }
  if (req.connection.user === undefined) {
    if (req.header('authorization') === undefined) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', ['NTLM', 'Basic']);
    } else {
      binding.authenticate(this.opts, req, res);
    }
  }
  if (!this.opts.authoritative || req.connection.user !== undefined) {
    next();
  } else {
    res.end();
  }
}

module.exports = main;