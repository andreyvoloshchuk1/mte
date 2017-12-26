const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const sass = require('node-sass');
const eachSlide = require('../lib/each-slide');

const config = require('../lib/main');

const log = config.log;
const paths = config.paths;
const methods = config.methods;
const progName = 'node-sass';

const sassCompiler = {
    /**
     * SASS Compiler.compile() [node-sass]
     *
     * @param options (file, outFile, sourceMap, outputStyle, logLevel (optional))
     */
    compile: (options) => {
        setTimeout(() => { // SetTimeout fot correctly working

            sass.render(options, (err, result) => {
                if (err) {
                    log.program.error(progName, err, '\n'+err.formatted)

                } else {
                    fs.writeFile(options.outFile, result.css, (err => {
                        if (options.logLevel !== 'silent') {
                            if (err) log.program.error(err);
                            else log.program.success(progName, 'Write:', chalk.magenta(options.outFile));
                        }
                    }));

                    const outFileMap = options.outFile.replace(/\.css$/, '.css.map');

                    fs.writeFile(outFileMap, result.map, (err => {
                        if (options.logLevel !== 'silent') {
                            if (err) log.program.error(err);
                            else log.program.success(progName, 'Write:', chalk.magenta(outFileMap));
                        }
                    }));
                }
            })

        }, 100); // End SetTimeout
    },

    /**
     * Compile 'style.scss' in all slides
     *
     * @param logLevel (optional)
     */
    compileAll: (logLevel) => {
        const iterations = methods.getDirectories(paths.currSlides);

        /** Compile sass-file in all slides **/
        iterations.forEach(lang => {
            eachSlide.onDir(lang, (options) => {
                const file = path.resolve(options.slidePath, 'css', 'style.scss');
                const outFile = file.replace(/\.scss$/, '.css');

                sassCompiler.compile({
                    file,
                    outFile,
                    logLevel,
                    sourceMap: true,
                    outputStyle: 'compressed'
                })
            });
        });
    }
};

module.exports = sassCompiler;
