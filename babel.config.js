module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      [
        'dotenv-import', {
          'moduleName': '@env',
          'path': '.env',
          'blacklist': null,
          'whitelist': null,
          'safe': false,
          'allowUndefined': false,
        }],
    ],
    presets: ['babel-preset-expo'],
  };
};
