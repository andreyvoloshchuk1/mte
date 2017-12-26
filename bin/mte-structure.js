#!/usr/bin/env node

const chalk = require('chalk');
const inquirer = require('inquirer');
const commander = require('commander');
const structureChanger = require('../lib/structure-changer');

/**
 * Usage.
 */

commander
    .option('add', 'Add slide')
    .option('del', 'Delete slide')
    .option('--flow   <flow>', 'Flow num')
    .option('--slide  <slide>', 'Slide num')
    .parse(process.argv);

/**
 * Help.
 */

commander.on('--help', () => {
    console.log('\n  Examples:\n');
    console.log(chalk.gray('    # Add new slide in flow_2 on position 5'));
    console.log('    $ mte --add --flow 2 --slide 5\n');
    console.log(chalk.gray('    # Delete new slide in flow_1 on position 3'));
    console.log('    $ mte --del --flow 1 --slide 3');
});

if (commander.args.length > 1) return commander.help();


/**
 * Add
 */

// Get Slide Name
if (commander.add) {
    inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Slide name:'
    }).then(slide => {
        if (commander.slide === '1') {
            inquirer.prompt({
                type: 'input',
                name: 'name',
                message: `You wont add slide on 1-st position, write Flow-${commander.flow} name:`
            }).then(flow => {
                new structureChanger(commander.flow, commander.slide, 'add', slide.name, flow.name);
            })
        } else {
            new structureChanger(commander.flow, commander.slide, 'add', slide.name);
        }
    })
}

/**
 * Delete
 */

if (commander.del) new structureChanger(commander.flow, commander.slide, 'del');

