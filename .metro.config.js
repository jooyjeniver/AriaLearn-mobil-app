/**
 * Metro configuration to prevent file locking errors
 */
module.exports = {
  // Skip watching problematic files that cause EBUSY errors
  watchFolders: [
    // Default project root
    __dirname,
  ],
  resolver: {
    // Blacklist problematic Android resource files
    blacklistRE: /android\/app\/build\/intermediates\/packaged_res\/debug\/mipmap-.+/,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}; 