#!/usr/bin/env node
const path = require('path');
const inquirer = require('inquirer');
const FontsConverter = require('../lib/font-converter');
const copyToAll = require('../lib/copy-to-all');
const config = require('../lib/main');

const paths = config.paths;

/**
 * Run
 */

(async () => {
    await new FontsConverter();

    inquirer.prompt({
        type: 'confirm',
        name: 'ok',
        message: 'Copy converted fonts to all slides?'
    }).then(answer => {
        if (answer.ok) {
            const fontsFrom = path.resolve(paths.currAssets, 'fonts');
            const fontsTo = path.resolve(paths.currSlides, 'fonts');

            // Copy
            copyToAll(fontsFrom, fontsTo)
        }
    })
})();