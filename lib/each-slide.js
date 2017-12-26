const path = require('path');
const chalk = require('chalk');
const config = require('../lib/main');

const log = config.log;
const paths = config.paths;
const methods = config.methods;
const variables = config.variables;

const projectData = require(path.resolve(paths.currentPath, variables.clmInfoFileName));

const eachSlide = {

    /** Loop go through all the slides folders
     ** get <langDir> [string ar Array], <callback> [function]
     *
     * @param langDir
     * @param callback
     */
    onDir: (langDir, callback) => {
        const flowsDir = path.resolve(paths.currSlides, langDir);
        const flows = methods.getDirectories(flowsDir);
        let lastFlow = false;

        flows.forEach((flow, flowIndex) => {
            const slidesDir = path.resolve(flowsDir, flow);
            const slides = methods.getDirectories(slidesDir);
            lastFlow = ++flowIndex === flows.length;

            slides.forEach((slide, slideIndex) => {
                if (typeof callback === 'function' || typeof callback === 'object') {
                    callback({
                        isLast: lastFlow && ++slideIndex === slides.length,
                        langDir: langDir,
                        slideDir: slide,
                        slidePath: path.join(slidesDir, slide),
                        slideIndex: slideIndex,
                        flowDir: flow,
                        flowPath: slidesDir,
                        flowIndex: flowIndex
                    });
                } else {
                    log.error('Second parameter must be a function!',
                        `eachSlide.onDir(lang, ${chalk.underline('callback')})\n You pass:  ${typeof callback}`)
                }
            })
        })
    },


    /** Loop go through all the structure
     ** get <langDir> [string], <callback> [function]
     *
     * @param lang
     * @param callback
     */
    onData: (lang, callback) => {
        const flowNum = projectData.clm.flowNumber;
        const main = flowNum > 1;


        for (let flow = 0; flow <= flowNum; flow++) {
            if (main && flow === 0) {
                callback({
                    lang,
                    flow,
                    slide: 'main'
                });
            } else {

                const slideNum = projectData.clm[`numberSlideInFlow-${flow}`];

                for (let slide = 1; slide <= slideNum; slide++) {
                    if (typeof callback === 'function') {
                        callback({
                            lang,
                            flow,
                            slide
                        });
                    } else {
                        log.error('Second parameter must be a function!',
                            `eachSlide.onData(lang, ${chalk.underline('callback')})`)
                    }
                }
            }
        }
    },


    /** Method which return array with all slides paths
     *
     * @param filter
     * @returns {Array}
     */
    getSlidesPaths: (filter) => {
        let slidesPath = [];
        const langs = methods.getDirectories(paths.currSlides);

        langs.forEach(lang => {
            eachSlide.onDir(lang, (options) => {
                slidesPath.push(options.slidePath)
            })
        });

        if (filter !== undefined) {
            if (filter.length < 3) {
                console.log(chalk.red('Invalid parameter: '), filter);
                process.exit(0);
            }

            filter = filter.replace(/(\\|\/)/g, '\\\\');
            slidesPath = slidesPath.filter(path => {
                if (path.match(filter)) return path
            });
        }

        return slidesPath;
    }
};

module.exports = eachSlide;