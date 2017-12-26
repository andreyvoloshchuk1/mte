#!/usr/bin/env node

const chalk = require('chalk');
const commander = require('commander');
const data = require('../config/initial-data');
const structureChanger = require('../lib/structure-changer');

/**
 * Usage.
 */

commander
    .option('--add', 'Add slide')
    .option('--flow   [flow]', 'Flow num')
    .option('--slide  [slide]', 'Slide num')
    .option('--filter [filter]', 'filter (only for lang)')
    .parse(process.argv);

/**
 * Help.
 */

commander.on('--help', () => {
    console.log('\n  Examples:\n');
    console.log(chalk.gray('    # add new slide to flow_2 on position 5'));
    console.log('    $ mte add --flow 2 --slide 5\n');
    console.log(chalk.gray('    # add new slide to flow_1 on position 3 only in UKR slides'));
    console.log('    $ mte add --flow 1 --slide 3 UKR');
});

function help() {
    commander.parse(process.argv);
    if (commander.args.length > 1) return commander.help()
}

help();


/**
 * Understand command
 */

const flow = commander.flow || commander.args[1];
const slide = commander.slide || commander.args[2];
const filter = commander.filter || commander.args[3];

if (data.lang.indexOf(filter) === -1)
    return console.log(chalk.red('Wrong filter, use only LANG filters:'), chalk.green(data.lang));

if (commander.add) structureChanger.add(flow, slide, filter);

