#!/usr/bin/env node
const chalk = require('chalk');

require('commander')
    .version(require('../package').version)
    .usage(`<command> [options ${chalk.yellow('(only init)')}]`)
    .command('init [lang]', 'initial a new project')
    .command('create', 'generate project')
    .command('dev', 'start dev-server')
    .command('build', 'generate ZIP for production')
    .command('copy', 'copy file/directory to all slides in your project')
    .command('font', 'convert fonts to "../assets/fonts" and connect it to "../global/style/fonts.scss"')
    .parse(process.argv);
