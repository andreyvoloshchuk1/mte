const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const chalk = require('chalk');

const progName = 'autoprefixer';

module.exports = (slides, options) => {

  slides.forEach(slide => {
    const cssPath = path.resolve(slide, 'css', 'style.css');
    const css = fs.readFileSync(cssPath);

    postcss([ autoprefixer(options) ])
      .process(css)
      .then(prefixResult => {
        prefixResult.warnings().forEach(warn => {
          console.warn(warn.toString())
        });

        fs.writeFileSync(cssPath, prefixResult.css);
      });
  });

  console.log(`[${chalk.green(progName)}] 'Prefixed all slides.`);
};