const fs = require('fs');
const Linter = require("eslint").Linter;
const chalk = require('chalk');
const linter = new Linter();
const custom_rules = require('../config/eslint-custom-rules');

/**
 * ESLint
 *
 * @param file
 * @param config
 */

module.exports = (file, config) => {

    const code = fs.readFileSync(file, 'utf8');

    const result = linter.verify(code, config, custom_rules);

    let message = result.length === 0
        ? `[${chalk.green('ESLint')}] Clear`
        : formattedError(result[0], file);

    console.log(message);

};

function formattedError(err, file) {
    return `[${chalk.red('ESLint')}] ${err.message} 
File: ${chalk.yellow(file)}
Line: ${err.line}
Column: ${err.column}`;
}