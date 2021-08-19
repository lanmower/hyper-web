// plugin-loader.js
const path = require('path');
const { PluginManager } = require('live-plugin-manager');
const pluginInstallFolder = path.resolve('data', '.plugins');
const pluginManager = new PluginManager();

var Module = require('module');
global.requireAsync = async (pkg) => {
  // installs pkg from npm
  await pluginManager.install(pkg);
  const package = pluginManager.require(pkg);
  return package
};


