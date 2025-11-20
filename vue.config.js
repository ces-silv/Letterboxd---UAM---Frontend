const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [],
  chainWebpack: (config) => {
    ;['progress', 'progress-plugin', 'ProgressPlugin'].forEach((name) => {
      try { config.plugins.delete(name) } catch (e) {}
    })
  },
  configureWebpack: (config) => {
    if (Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter((p) => {
        const name = p && p.constructor && p.constructor.name
        return name !== 'ProgressPlugin' && name !== 'Progress'
      })
    }
  }
})
