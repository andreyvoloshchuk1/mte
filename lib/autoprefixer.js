const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const chalk = require('chalk');

const progName = 'autoprefixer';

module.exports = (slides, options) => {

    slides.forEach(slide => {
        const cssPath = path.resolve(slide, 'css', 'style.css');

        fs.readFile(cssPath, (err, result) => {
            if (err) console.log(err);

            postcss([autoprefixer(options)]).process(result).then(prefixResult => {
                prefixResult.warnings().forEach(warn => console.warn(warn.toString()));

                fs.writeFile(cssPath, prefixResult.css, (err => {
                    if (err) console.log(err);
                    else console.log(`[${chalk.green(progName)}] 'Prefixed:' ${chalk.magenta(cssPath)}`);
                }));


            });
        });
    });
};