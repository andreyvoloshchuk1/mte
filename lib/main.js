const fs = require('fs-extra');
const path = require('path');
const logSymbols = require('log-symbols');
const chalk = require('chalk');

// Variables
const variables = {
    navDataFileName: 'navigation-data.json',
    clmInfoFileName: 'clm-info.json',
    maxSlidesNum: 200,
    maxFlowNum: 50,
    git: 'https://github.com/elevenfloor/mte-modules.git'
};

// Paths
const paths = {
    currentPath: process.cwd(),
    build: 'build',
    slides: 'slides',
    assets: 'assets',
    config: 'config',
    global: 'global',
    styles: 'styles',
    scripts: 'scripts',
    modules: 'modules',
};

paths.currSlides = path.resolve(paths.currentPath, paths.slides);
paths.currBuild = path.resolve(paths.currentPath, paths.build);
paths.currAssets = path.resolve(paths.currentPath, paths.assets);
paths.currGlobal = path.resolve(paths.currentPath, paths.global);
paths.currGlobalScripts = path.resolve(paths.currentPath, paths.global, paths.scripts);

const methods = {
    // Get Array of All Directories in the Transmitted Path
    getDirectories: (inPath) => {
        return fs.readdirSync(inPath).filter((file) => fs.statSync(`${inPath}/${file}`).isDirectory())
    },

    // Get Array of All Files in the Transmitted Path
    getFiles: (inPath) => {
        return fs.readdirSync(inPath).filter((file) => !fs.statSync(`${inPath}/${file}`).isDirectory())
    },

    // Get Array of All Contents in the Transmitted Path
    getContent: (inPath) => {
        return fs.readdirSync(inPath)
    },

    // Create Directory in Transmitted Path
    mkDir: (inPath, directory) => {
        if (!fs.existsSync(path.join(inPath, directory))) {
            fs.mkdirSync(path.join(inPath, directory));
        }
    },

    // Create File in Transmitted Path
    mkFile: (inPath, content) => {
        fs.writeFile(inPath, content, (err) => {
            if (err) throw err
        })
    },

    // Remove directory or file
    rmDir: (inPath, directory) => {
        const dir = path.resolve(inPath, directory);
        if (fs.existsSync(dir)) fs.removeSync(dir);
    },

    // Check if slides dir is already exist in current directory
    isCreated: (inPath, directory) => {
        // All Folders in project
        const dirList = methods.getDirectories(inPath);

        let created = false;

        // Search 'slides' folder
        dirList.forEach(dir => {
            if (dir === directory) {
                created = true;
                return false;
            }
        });

        return created;
    }
};

// Console commands
const log = {
    success: (text, msg) => {
        const message = msg ? `${text}\n  \x1b[32m${msg}\x1b[0m` : text;
        console.log('\n' + logSymbols.success, message);
    },
    error: (text, err) => {
        const message = err ? `${text}\n  \x1b[31m${err}\x1b[0m` : text;
        console.log('\n' + logSymbols.error, message);
    },
    warning: (text, warm) => {
        const message = warm ? `${text}\n  \x1b[33m${warm}\x1b[0m` : text;
        console.log(logSymbols.warning, message);
    },
    info: (text, inf) => {
        const message = inf ? `${text}\n  \x1b[36m${inf}\x1b[0m` : text;
        console.log(logSymbols.info, message);
    },
    program: {
        message: (prog, text, data) => {
            const message = data ? `${text} ${chalk.yellow(data)}` : text;
            console.log(`[${chalk.blue(prog)}] ${message}`)
        },
        error: (prog, text, data) => {
            const message = data ? `${text} ${chalk.yellow(data)}` : text;
            console.log(`[${chalk.red(prog)}] ${message}`)
        },
        success: (prog, text, data) => {
            const message = data ? `${text} ${chalk.yellow(data)}` : text;
            console.log(`[${chalk.green(prog)}] ${message}`)
        }
    }
};

module.exports = {
    variables,
    methods,
    paths,
    log
};

