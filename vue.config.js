// vue.config.js
const version = process.env.npm_package_version
// const path = require('path')

module.exports = {
  devServer: {
    overlay: {
      warnings: true,
      errors: true
    }
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
  assetsDir: 'field-filemanager-' + version,
  filenameHashing: false,
  configureWebpack: config => {
  },
  chainWebpack: (config) => {
    // const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    // types.forEach(type => addStyleResource(config.module.rule('stylus').oneOf(type)))
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "stylus",
      patterns: [
        //         path.resolve(__dirname, './src/styles/imports.styl')
      ]
    }
  }
}

// function addStyleResource (rule) {
//   rule.use('style-resource')
//     .loader('style-resources-loader')
//     .options({
//       patterns: [
//         path.resolve(__dirname, './src/styles/imports.styl'),
//       ],
//     })
// }
