const fs = require('fs');
const chalk = require('chalk');
const babel = require("babel-core");

const jsCompiler = {
    /**
     * JS Compiler (Babel)
     *
     * @param options (file, outFile, logLevel (optional), Babel options... )
     */
    compile: (options) => {
        setTimeout(() => {

            babel.transformFile(options.file, options.babel, function (err, result) {
                if (err) {
                    console.log(`[${chalk.red('Babel')}] ${err}`);
                } else {
                    fs.writeFile(options.outFile, result.code, (err => {
                        const success = `[${chalk.green('Babel')}] 'Write:' ${chalk.magenta(options.outFile)}`;
                        if (options.logLevel !== 'silent') {
                            console.log(err ? err : success);
                        }
                    }));
                }
            });

        }, 100)
    }
};

module.exports = jsCompiler;