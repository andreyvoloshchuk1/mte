#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const shell = require('shelljs');
const inquirer = require('inquirer');
const eachSlide = require('../lib/each-slide');
const config = require('../lib/main');
const FontsConverter = require('../lib/font-converter');
const sassCompiler = require('../lib/sass-compiler');

const variables = config.variables;
const methods = config.methods;
const paths = config.paths;
const log = config.log;

const projectData = require(path.resolve(paths.currentPath, variables.clmInfoFileName));
const bundleScripts = require('../config/bundle.config');
const slidesDirName = paths.slides;

// Structure numbers
const flowNumber = projectData.clm.flowNumber;
const mainExist = flowNumber > 1;
const isCreated = methods.isCreated(paths.currentPath, paths.slides);
let IDPattern;

/**
 * Check if Presentation is Already Created
 */

if (isCreated) {
    log.warning('Presentation already exist!');

    const replaceQuestion = {
        type: 'confirm',
        name: 'check',
        message: 'Replace all slides?'
    };

    inquirer.prompt(replaceQuestion).then(replaceAnswer => {
        if (replaceAnswer.check) {
            removeSlidesDir();
            run();

        } else {
            log.info(`Nothing's new created\n  Previous version is not modified.`);
            return false;
        }
    });
} else {
    run();
}

/**
 * Create Structure
 */

function run() {
    /** Create bundle.js **/
    createBundle();

    /** Convert fonts **/
    new FontsConverter;

    /** Create Slides Directory **/
    createSlidesDir();

    if (projectData.clm.lang === 'ALL') {
        projectData.clm.templateName.forEach(name => {
            IDPattern = name;
            const lang = getLangFromTempName(IDPattern);
            const langDir = '\\' + getLangFromTempName(IDPattern);

            // Create lang dir [UKR, RUS]
            methods.mkDir(paths.currSlides, langDir);

            /* Loop go through all the slide folders
             * generateSlideContent => copy all from assets and generate necessary files */
            eachSlide.onData(lang, generateSlideContent);
        })
    } else {
        IDPattern = projectData.clm.templateName[0];
        const lang = getLangFromTempName(IDPattern);
        const langDir = '\\' + getLangFromTempName(IDPattern);

        // Create lang dir (UKR/RUS)
        methods.mkDir(paths.currSlides, langDir);

        eachSlide.onData(lang, generateSlideContent);
    }


    /** Compile sass-file in all slides for begin development **/
    setTimeout(() => {
        sassCompiler.compileAll('silent');
        log.success('Done, your project has been created!', `"${paths.currSlides}"\n`);
    }, 500);
}


/** Doing necessary actions with one slide in all slides
 ** Function onData.eachSlide set <options> to this func
 *
 * @param options
 */
function generateSlideContent(options) {
    const lang = options.lang;
    const flow = options.flow;
    const slide = options.slide;
    const flowDir = slide === 'main' ? flow + '_main' : flow + '_flow';
    const flowPath = path.resolve(paths.currSlides, lang);
    const ID = flow + IDPattern + generateIDSuffix(slide);
    const slidePath = path.resolve(flowPath, flowDir);
    const slideDirPath = path.resolve(slidePath, ID);

    createStructureDir(slide, flowPath, flowDir, slidePath, ID);
    copyAssets(slideDirPath);
    createScripts(slideDirPath, ID);
    createParameters(slideDirPath, ID);
    createCss(slideDirPath, ID);
    createData(slideDirPath, ID, lang, flow);
}

/** Create Empty slide folder
 *
 * @param slide
 * @param flowPath
 * @param flowDir
 * @param slidePath
 * @param slideDir
 */
function createStructureDir(slide, flowPath, flowDir, slidePath, slideDir) {
    // Create Flow dir
    if (slide === 1 || slide === 'main') methods.mkDir(flowPath, flowDir);

    // Create Slide dir
    methods.mkDir(slidePath, slideDir);
}

/** Copy content from '../assets'
 *
 * @param slidePath
 */
function copyAssets(slidePath) {
    fs.copySync(paths.currAssets, slidePath);
}

/** Copy and rewrite 'script.js'
 *
 * @param slideDirPath
 * @param ID
 */
function createScripts(slideDirPath, ID) {
    // Rewrite and parse [script.js, script.compiled.js]
    const scriptGlobalPath = path.resolve(paths.currGlobalScripts, 'script.js');
    const slideJSPath = path.resolve(slideDirPath, 'js');
    const slideJSScriptsPath = path.resolve(slideDirPath, 'js', 'scripts');

    const options = `({
    id: '${ID}',
    mainExist: ${mainExist}   
})`;

    const script = fs.readFileSync(scriptGlobalPath, 'utf8').replace('(options)', options);
    const scriptCompiled = "'use strict'\n" + script.replace('(options)', options);

    methods.mkFile(path.resolve(slideJSScriptsPath, 'script.js'), script);
    methods.mkFile(path.resolve(slideJSPath, 'script.compiled.js'), scriptCompiled);
}

/**
 * Create 'bundle.js' and 'js' dir in '../assets'
 */
function createBundle() {
    // Create 'js' folders in '../assets'
    methods.mkDir(paths.currAssets, 'js');
    methods.mkDir(path.resolve(paths.currAssets, 'js'), 'core');
    methods.mkDir(path.resolve(paths.currAssets, 'js'), 'scripts');

    // Create and copy to ../assets/core 'bundle.js' from scripts list in 'bundle.config.js'
    const bundle = [];
    const bundleFile = path.resolve(paths.currAssets, 'js', 'core', 'bundle.js');

    bundleScripts.forEach(script => {
        bundle.push(fs.readFileSync(script, 'utf8'));
    });

    // methods.mkFile(bundleFile, bundle.join('\n'));
    // concatenate
    shell
        .cat(bundleScripts)
        .to(bundleFile);
}

/** Create '../parameters/parameters.xml'
 *
 * @param slideDirPath
 * @param ID
 */
function createParameters(slideDirPath, ID) {
    const paramText = `<Sequence Id="${ID}" xmlns="urn:param-schema"></Sequence>`;
    const paramPath = path.resolve(slideDirPath, 'parameters', 'parameters.xml');

    methods.mkDir(slideDirPath, 'parameters');
    methods.mkFile(paramPath, paramText);
}

/** Create '../css/style.scss'
 *
 * @param slideDirPath
 * @param ID
 */
function createCss(slideDirPath, ID) {
    const styleText = '@import "../../../../../global/style/main";';
    const stylePath = path.resolve(slideDirPath, 'css', 'style.scss');

    methods.mkDir(slideDirPath, 'css');
    methods.mkFile(stylePath, styleText);
}

/** Create data-JSON and write in '../data/'
 *
 * @param slideDirPath
 * @param ID
 * @param lang
 * @param flowNum
 */
function createData(slideDirPath, ID, lang, flowNum) {
    methods.mkDir(slideDirPath, 'data');

    /** Create Data Menu **/
    const navigationData = require(path.resolve(paths.currentPath, variables.navDataFileName));
    const navigationDataPath = path.resolve(slideDirPath, 'data', 'data-menu.json');

    let dataMenuText = {};
    let flow = [];
    let slides = navigationData[lang][`Flow-${flowNum}`];

    if (mainExist) dataMenuText.main = `0${IDPattern}main`;

    // push all first obj of all slides
    for (let j = 1; j <= flowNumber; j++) {
        flow.push({
            id: navigationData[lang][`Flow-${j}`][0].id,
            name: navigationData[lang][`Flow-${j}`][0].flow_name
        });
    }

    dataMenuText.flow = flow;
    dataMenuText.slides = slides;

    methods.mkFile(navigationDataPath, JSON.stringify(dataMenuText, null, '  '));

    /** Create Data Popup **/
    const popupData = require(path.resolve(paths.currGlobal, 'data', 'data-popup.pattern.json'));
    const popupDataPath = path.resolve(slideDirPath, 'data', 'data-popup.json');

    methods.mkFile(popupDataPath, JSON.stringify(popupData[lang], null, '  '));

    /** Create Data Content **/
    const contentData = require(path.resolve(paths.currGlobal, 'data', 'data-content.pattern.json'));
    const contentDataPath = path.resolve(slideDirPath, 'data', 'data-content.json');

    methods.mkFile(contentDataPath, JSON.stringify(contentData[lang], null, '  '));
}

// Generate ID sl suffix
function generateIDSuffix(slide) {
    if (slide === 'main') return 'main';
    return slide >= 10 ? 'sl_' + slide : 'sl_0' + slide
}

// Get lang from templateName
function getLangFromTempName(name) {
    let lang = name.split('_');
    lang.pop();
    return lang.pop();
}

// Create HTML root directory
function createSlidesDir() {
    methods.mkDir(paths.currentPath, slidesDirName);
}

// Remove HTML root directory
function removeSlidesDir() {
    methods.rmDir(paths.currentPath, slidesDirName);
}