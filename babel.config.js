module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    'module:react-native-dotenv',
  ],
  plugins: [
    [
      'module:@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
  ],
};
