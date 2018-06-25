#!/usr/bin/env node

const bs = require('browser-sync').create('BS dev-mode');
const sassCompiler = require('../lib/sass-compiler');
const jsCompiler = require('../lib/js-compiler');
const jsLinter = require('../lib/js-linter');

const babel_preset_env = require('babel-preset-env');
const babel_preset_react = require('babel-preset-react');
const babel_preset_vue = require('babel-preset-vue');
const eslint_config = require('eslint-config-airbnb-base');

const config = require('../lib/main');
const paths = config.paths;

bs.init({
    open: false,
    reloadDelay: 100,
    reloadDebounce: 2000,
    logPrefix: 'mte dev',
    server: {
        baseDir: paths.currSlides,
        directory: true
    },
    files: [
        paths.currentPath,
        {
            match: ['**/*.scss', '**/js/scripts/*.js'],
            fn: (event, file) => {
                const directory = file.split('\\')[0];
                const fileType = file.split('.').pop();

                /** 'slides' listener on change **/
                if (directory === paths.slides && (event === 'change' || event === 'unlink')) {
                    slidesListener(file, fileType);
                }

                /** 'global' Listener on change **/
                if (directory === paths.global && (event === 'change' || event === 'unlink')) {
                    globalListener(fileType);

                }

                // /** 'assets' Listener **/
                // if (directory === paths.assets) {
                //     assetsListener(file, fileType, event);
                // }


            },
            options: {
                ignored: ['**/*.css', '**/*.map', '**/*.compiled.js']
            }
        }
    ]
});


/**
 * Listen Changes in 'slides' directory
 *
 * @param file
 * @param fileType
 */

function slidesListener(file, fileType) {

    /** SCSS **/
    if (fileType === 'scss') {
        const outFile = file.replace('.scss', '.css');

        sassCompiler.compile({
            file,
            outFile,
            sourceMap: true,
            outputStyle: 'compressed'
        })
    }

    /** JS **/
    if (fileType === 'js') {
        const outFile = file.replace('\\js\\scripts\\', '/js/').replace('.js', '.compiled.js');
        // jsLinter(file, eslint_config);

        jsCompiler.compile({
            file,
            outFile,
            babel: {
                presets: [babel_preset_env, babel_preset_react, babel_preset_vue],
                babelrc: false,
                minified: false
            }
        });
    }
}


/**
 * Listen Changes in 'global' directory
 *
 * @param fileType
 */
function globalListener(fileType) {

    /** SCSS **/
    if (fileType === 'scss') {
        sassCompiler.compileAll();
    }
}