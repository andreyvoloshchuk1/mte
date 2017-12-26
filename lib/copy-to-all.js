const fsex = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const eachSlide = require('../lib/each-slide');
const config = require('../lib/main');

const log = config.log;
const paths = config.paths;


module.exports = async function copyToAll(from, to, filter) {

    const fromPath = from;
    const toPath = to;
    const toName = path.parse(fromPath).base;
    const slides = eachSlide.getSlidesPaths(filter);
    const slidesPos = toPath.split(path.sep).indexOf(paths.slides);
    const suffix = path.join(toPath.split(path.sep).slice(slidesPos + 4).join(path.sep), toName);

    // Break when 'toPath' haven't slides dir
    if (slidesPos === -1) return log.error(`${chalk.yellow(paths.slides)} directory not found`, 'You pass to: ' + toPath);

    inquirer.prompt({
        type: 'confirm',
        name: 'ok',
        message: `Copy from: "${chalk.green(fromPath)}", \n  to: "${chalk.green(`..\\[slide_dir]\\${suffix}`)}"?`
    }).then(answer => {
        if (answer.ok) {
            // Copy
            slides.forEach(sl => {
                const prefix = sl.split(path.sep).slice(slidesPos).join(path.sep);
                const destPath = path.resolve(prefix, suffix);

                fsex.copy(fromPath, destPath, err => {
                    if (err) return console.error(err);

                    console.log('Copy to:', destPath)
                })
            })
        }
    })
};