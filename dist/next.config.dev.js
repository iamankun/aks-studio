"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @type {import('next').NextConfig} */
var nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: ["http://aks.ankun.dev", "http://*.aks.ankun.dev", "http://aks.wp.local", "http://*.aks.wp.local", "http://192.168.1.3:3000"],
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  webpack: function webpack(config, _ref) {
    var dev = _ref.dev,
        isServer = _ref.isServer;
    // Add error logging for build issues
    config.infrastructureLogging = {
      level: 'error'
    }; // Add fallbacks for node modules

    config.resolve.fallback = _objectSpread({}, config.resolve.fallback, {
      fs: false,
      net: false,
      tls: false
    }); // Log when build is running

    if (dev && isServer) {
      console.log('🔄 Next.js build running with config:', {
        reactStrictMode: nextConfig.reactStrictMode,
        experimental: nextConfig.experimental
      });
    }

    return config;
  },
  // Configure external logging
  onDemandEntries: {
    // Keep pages in memory for 60 seconds to help with development
    maxInactiveAge: 60 * 1000
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  }
};
module.exports = nextConfig;