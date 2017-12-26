const scriptPath = require('../lib/main').paths.currGlobalScripts;
const path = require('path');

module.exports = [

    '/lib/jquery.js',
    // '/lib/jquery-ui.min.js',
    // '/lib/jquery.ui.touch-punch.js',
    '/lib/handlebars-v4.0.11.js',
    '/lib/swiper.min.js',
    '/core/template-loader.js',
    '/core/popup-controller.js',
    '/core/navigation.js',
    '/core/main.js'

].map(script => {
    return path.join(scriptPath, script)
});