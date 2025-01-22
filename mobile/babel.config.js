module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            'module:metro-react-native-babel-preset',
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-typescript',
          ],
      plugins: [
        'react-native-reanimated/plugin',
        ['@babel/plugin-proposal-private-methods', { loose: false }],
        ['@babel/plugin-proposal-class-properties', { loose: false }],
        ['@babel/plugin-transform-private-property-in-object', { loose: false }],
      ],
    };
  };
  