// vue.config.js
const version = process.env.npm_package_version

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
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "stylus",
      patterns: []
    }
  }
}
