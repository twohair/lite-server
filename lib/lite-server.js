"use strict";
/**
 * lite-server : Simple server for angular/SPA projects
 *
 * Simply loads some default browser-sync config that apply to SPAs,
 * applies custom config overrides from user's own local `bs-config.{js|json}` file,
 * and launches browser-sync.
 */
const browserSync = require("browser-sync").create("lite-server");
const path = require("path");
const _ = require("lodash");
const config = require("./config-defaults");

module.exports = function start(opts, cb) {
  opts = opts || {};
  opts.argv = opts.argv || process.argv;
  opts.console = opts.console || console;
  cb = cb || function noop() {};

  // Load configuration
  const argv = require("minimist")(opts.argv.slice(2));
  const bsConfigName = argv.c || argv.config || "bs-config";

  // Load optional browser-sync config file from user's project dir
  const bsConfigPath = path.resolve(bsConfigName);
  let overrides = {};
  try {
    overrides = require(bsConfigPath);
  } catch (err) {
    if (err.code && err.code === "MODULE_NOT_FOUND") {
      logMissingConfigFile();
    } else {
      throw err;
    }
  }

  // Set optional baseDir
  config.server.baseDir = argv.baseDir || config.server.baseDir;
  config.open = argv.open || config.open;
  config.startPath = argv.startPath || argv.o || config.startPath;
  config.port = argv.port || argv.p || config.port;

  if (typeof overrides === "function") {
    overrides = overrides(browserSync);
  }

  _.merge(config, overrides);

  // Fixes browsersync error when overriding middleware array
  if (config.server.middleware) {
    config.server.middleware = _.compact(config.server.middleware);
  }

  logConfig();

  // Run browser-sync
  browserSync.init(config, cb);

  return browserSync;

  function logEnabled() {
    return config.logLevel !== "silent";
  }

  function logConfig() {
    if (logEnabled()) {
      opts.console.log("** browser-sync config **");
      opts.console.log(config);
    }
  }

  function logMissingConfigFile() {
    if (logEnabled()) {
      opts.console.info(
        "Did not detect a `bs-config.json` or `bs-config.js` override file." +
          " Using lite-server defaults..."
      );
    }
  }
};
