#!/usr/bin/env node

const gitClone = require('git-clone');
const commander = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const config = require('../lib/main');
const data = require('../config/initial-data');

// Config
const variables = config.variables;
const methods = config.methods;
const paths = config.paths;
const log = config.log;

/**
 * Usage.
 */

commander
    .usage('<lang> [UKR, RUS]')
    .option('-L', '--lang', 'use --lang for generate single-lang project');

/**
 * Help.
 */

commander.on('--help', () => {
    console.log('\n  Examples:\n');
    console.log(chalk.gray('    # initial a new project with two lang patterns'));
    console.log('    $ mte init\n');
    console.log(chalk.gray('    # initial a new project with one lang pattern'));
    console.log('    $ mte init --lang UKR');
    console.log('    $ mte init UA');
    console.log('    $ mte init ukr');
    console.log('    $ mte init u');
});

function help() {
    commander.parse(process.argv);
    if (commander.args.length > 1) return commander.help()
}

help();

/**
 * Help.
 */


/**
 * Settings.
 */

const maxSlidesNum = variables.maxSlidesNum;
const maxFlowNum = variables.maxFlowNum;
const lang = setLang(commander.args[0]).toLocaleUpperCase();
const isInitialized = fs.existsSync(path.join(paths.currentPath, variables.clmInfoFileName));


/**
 * Check if project is initialized.
 */

if (isInitialized) {
    inquirer.prompt({
        type: 'confirm',
        name: 'ok',
        message: 'Project has already initialized. Do you want init new project?\n' +
        '  All files in '+ chalk.cyan(paths.currentPath) +' will be '+ chalk.red('deleted')
    }).then(answer => {
        if (answer.ok) {
            // Clear Current Directory
            clearCurrentDir();
            // Run
            runInit();
        }
    })
} else {
    // Run
    runInit();
}

/**
 * Run initialization.
 */

function runInit() {
    let allAnswers = [];
    let projectQuestionsPart_2 = []; // Question about project part 2 (depending on the answers in part 1)

    // Staff Part of all init questions
    const StaffQuestions = [
        {
            type: 'list',
            name: 'developer',
            message: 'What your name?',
            choices: data.developers
        },
        {
            type: 'list',
            name: 'designer',
            message: 'Who did the design?',
            choices: data.designers
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Who is the manager?',
            choices: data.managers
        }
    ];

    // Question about project part 1
    const projectQuestionsPart_1 = [
        {
            type: 'input',
            name: 'shortDrugName',
            message: 'SHORT drug name (PREP)',
            validate: (value) =>
                parseFloat(value) || value.length < 3 ? 'Enter a string (more than three characters)' : true,
            filter: (value) => value.toUpperCase()
        },
        {
            type: 'list',
            name: 'cycle',
            message: 'Cycle?',
            choices: data.cycle
        },
        {
            type: 'list',
            name: 'shortYear',
            message: 'Year?',
            choices: data.years
        },
        {
            type: 'input',
            name: 'flowNumber',
            message: 'Enter the number of Flow:',
            validate: (value) =>
                !parseInt(value) || value >= maxFlowNum ? `Please enter a number (less than ${maxFlowNum})` : true
        }
    ];


    // Staff Part of initialisation
    inquirer.prompt(StaffQuestions).then(StaffAnswers => {

        // Add 'StaffAnswers' to result in 'staff' object
        allAnswers.push({staff: StaffAnswers});

        // Project Part 1 of initialisation
        inquirer.prompt(projectQuestionsPart_1).then(projectAnswersPart_1 => {

            // Depending on the number of flow's create question about number of slides in flow
            generateOuestionsPart2(projectAnswersPart_1, projectQuestionsPart_2);

            // Project Part 1 of initialisation (depending on the answers in part 1)
            inquirer.prompt(projectQuestionsPart_2).then(projectAnswersPart_2 => {
                if (!projectAnswersPart_2.check) {
                    log.info('Again please.');
                    runInit();
                } else {
                    // Create template name
                    const templateName = generateTemplateName(projectAnswersPart_1);
                    
                    // download project modules from git
                    console.log('Downloading git repository...');
                    gitClone(variables.git, paths.currentPath, err => {
                        if (err) {
                            console.log(err);
                            console.log('if error code = ' + chalk.red('128') + ' clear ' + chalk.yellow(paths.currentPath) + ' directory');
                            return false
                        }
                        console.log('Download complete.');

                        // create project info and write file
                        createProjectInfo(projectAnswersPart_1, projectAnswersPart_2, allAnswers, templateName);

                        // create structure and write file
                        createStructure(projectAnswersPart_1, projectAnswersPart_2, templateName);

                        // remove '.git' dir
                        methods.rmDir(paths.currentPath, '.git');
                    })
                }
            });
        });
    });
}

function generateTemplateName(PAP_1) {
    return lang === 'ALL'
        ? [`_${PAP_1.shortDrugName}_${PAP_1.cycle}_${PAP_1.shortYear}_UKR_`,
            `_${PAP_1.shortDrugName}_${PAP_1.cycle}_${PAP_1.shortYear}_RUS_`]
        : [`_${PAP_1.shortDrugName}_${PAP_1.cycle}_${PAP_1.shortYear}_${lang}_`]
}

function answerNumSlidesInFlow(flow) {
    return {
        type: 'input',
        name: `numberSlideInFlow-${flow}`,
        message: `Enter the number of slides if Flow-${flow}:`,
        validate: (value) =>
            !parseInt(value) || value >= maxSlidesNum ? `Please enter a number (less than ${maxSlidesNum})` : true
    }
}

function generateOuestionsPart2(PAP_1, PQP_2) {
    for (let i = 1; i <= PAP_1.flowNumber; i++) {
        // Add question to 'PQP_2'
        PQP_2.push(answerNumSlidesInFlow(i))
    }
    // Add last check question
    PQP_2.push({
        type: 'confirm',
        name: 'check',
        message: 'Information entered correctly?'
    });
}

function createProjectInfo(PAP_1, PAP_2, allAnswers, templateName) {
    const ProjectAnswers = Object.assign(PAP_1, PAP_2);

    delete ProjectAnswers.check;

    // Add lang
    ProjectAnswers.lang = lang;
    ProjectAnswers.templateName = templateName;

    // Add 'ProjectAnswers' to allAnswers in 'project-info' object
    allAnswers.push({clm: ProjectAnswers});

    // Transform array to one object
    const result = Object.assign(allAnswers[0], allAnswers[1]);

    // create clm-info.json with 'result'
    methods.mkFile(`${paths.currentPath}/${variables.clmInfoFileName}`, JSON.stringify(result, null, '  '))
}

function createStructure(PAP_1, PAP_2, templateName) {
    const flowNumber = PAP_1.flowNumber;
    let finalStructure = {};

    if (lang === 'ALL') {
        // Two navigation structure
        finalStructure.UKR = structureLoop(flowNumber, PAP_2, templateName[0]);
        finalStructure.RUS = structureLoop(flowNumber, PAP_2, templateName[1]);

    } else {
        // One navigation structure
        finalStructure[lang] = structureLoop(flowNumber, PAP_2, templateName[0]);
    }

    // create navigation-structure.json
    methods.mkFile(path.resolve(paths.currentPath, variables.navDataFileName), JSON.stringify(finalStructure, null, '  '));

    log.success('Well done!', 'Follow the instructions below.');
    console.log(
        '  1. Complete '+ chalk.yellow(variables.navDataFileName) + ' in '+ chalk.yellow(paths.currentPath) + '\n' +
        '  2. Put your fonts to ' + chalk.yellow(paths.currAssets + '/fonts') + '\n' +
        '  3. Run npm command: ' + chalk.underline('mte create'));
}

function structureLoop(flowNumber, PAP_2, templateName) {
    let result = {};
    for (let flow = 1; flow <= flowNumber; flow++) {
        const key = PAP_2[`numberSlideInFlow-${flow}`];
        let flowTemp = [];

        for (let slide = 1; slide <= key; slide++) {
            // Change slTemplate After 10th Slide
            let slTemplate = slide >= 10 ? 'sl_' : 'sl_0';

            if (slide === 1) {
                flowTemp.push({
                    id: `${flow}${ templateName + slTemplate }${slide}`, name: "", flow_name: ""
                })
            } else {
                flowTemp.push({
                    id: `${flow}${ templateName + slTemplate }${slide}`, name: ""
                })
            }
        }
        result[`Flow-${flow}`] = (flowTemp);
    }
    return result;
}

function setLang(val) {
    if (!val) return 'ALL';

    const lang = val.toLocaleUpperCase();

    if (lang === 'U' || lang === 'UKR' || lang === 'UA') return 'UKR';
    if (lang === 'R' || lang === 'RUS' || lang === 'RU') return 'RUS';

    console.error(`\n  ${chalk.red('Invalid parameter')} --lang`);
    commander.help();
    process.exit(0);
}

function clearCurrentDir() {
    const contents = methods.getContent(paths.currentPath);

    contents.forEach(content => {
        methods.rmDir(paths.currentPath, content)
    })
}