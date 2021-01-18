module.exports = {
    "transpileDependencies": [
        "vuetify",
        "vuex-module-decorators"
    ],
    devServer: {
        host: '0.0.0.0',
        port: 1997, // CHANGE YOUR PORT HERE!
        https: true,
        hotOnly: false,
    },
    publicPath: '/__corona/'
}