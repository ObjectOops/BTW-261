// The source code including full typescript support is available at: 
// https://github.com/shakacode/react_on_rails_demo_ssr_hmr/blob/master/config/webpack/commonWebpackConfig.js

// Common configuration applying to client and server configuration
const { generateWebpackConfig, merge } = require('shakapacker');

const baseClientWebpackConfig = generateWebpackConfig();

const commonOptions = {
  resolve: {
    extensions: ['.css', '.ts', '.tsx'],
  },
};

// Copy the object using merge b/c the baseClientWebpackConfig and commonOptions are mutable globals
const commonWebpackConfig = () => {
  const baseWebpackConfig = merge({}, baseClientWebpackConfig, commonOptions);

  // Fix CSS modules to use default exports for backward compatibility
  baseWebpackConfig.module.rules.forEach((rule) => {
    if (rule.use && Array.isArray(rule.use)) {
      const cssLoader = rule.use.find((loader) => {
        const loaderName = typeof loader === 'string' ? loader : loader?.loader;
        return loaderName?.includes('css-loader');
      });

      if (cssLoader?.options?.modules) {
        cssLoader.options.modules.namedExport = false;
        cssLoader.options.modules.exportLocalsConvention = 'camelCase';
      }
    }
  });

  return baseWebpackConfig;
};

module.exports = commonWebpackConfig;