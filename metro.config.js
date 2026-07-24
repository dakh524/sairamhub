const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable package exports to avoid resolving Node-specific dependencies in @supabase packages
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
