#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const commander = require('commander');
const eachSlide = require('../lib/each-slide');
const autoprefixer = require('../lib/autoprefixer');
const thumbMaker = require('../lib/thumb-maker');
const archiveMaker = require('../lib/archive-maker.js');
const config = require('../lib/main');

const paths = config.paths;
const methods = config.methods;

const isBuild = methods.isCreated(paths.currentPath, paths.build);

const thumbsSettings = {
  name: '200x150',
  format: 'jpg',
  screenSize: {
    width: 1280,
    height: 720,
  },
  thumbSize: {
    width: 200,
    height: 150,
  },
};

const autoprefixConfig = {
  browsers: [
    "ie >= 11",
    "iOS 8.1", // DON'T DELETE, IT'S FOR PHANTOMJS
  ],
};


/**
 * Usage.
 */

commander
  .usage('<filter> [UKR, RUS]')
  .option('-L', '--lang', 'use --lang for generate single-lang project');

/**
 * Help.
 */

commander.on('--help', () => {
  console.log('\n  Examples:\n');
  console.log(chalk.gray('    # bulid all slides to production'));
  console.log('    $ mte build\n');
  console.log(chalk.gray('    # bulid filtered slides to production'));
  console.log('    $ mte build --filter 2_flow');
  console.log('    $ mte build -f 1_EXAM_C2_18_UKR_sl_05');
  console.log('    $ mte build UKR/1_flow');
  console.log('    $ mte build RUS');
});

function help() {
  commander.parse(process.argv);
  if (commander.args.length > 1) return commander.help()
}

help();

/**
 * Check if project has builded.
 */

if (isBuild) {
  inquirer.prompt({
    type: 'confirm',
    name: 'ok',
    message: 'Project has already builded. Do you want build again?\n' +
    '  Files in ' + chalk.cyan(paths.currBuild) + ' will be ' + chalk.red('rewrite'),
  }).then(answer => {
    if (answer.ok) {
      // Clear Build Directory
      // clearBuildDir();
      run();
    }
  })
} else {
  run();
}

/**
 * Run
 */

function run() {
  let filter = commander.args[ 0 ];
  const slides = eachSlide.getSlidesPaths(filter);

  build(slides);
}

/**
 * Run build.
 */

function build(slides) {

  autoprefixer(slides, autoprefixConfig);

  new thumbMaker(slides, thumbsSettings)
    .run()
    .then(() => {
      archiveMaker(slides)
        .then(() => {
          console.log('\nBuild complete.');
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}
