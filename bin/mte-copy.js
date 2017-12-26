#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fsui = require('fs-explorer-ui');
const commander = require('commander');
const copyToAll = require('../lib/copy-to-all');
const config = require('../lib/main');

const log = config.log;
const paths = config.paths;

/**
 * Usage.
 */

commander
    .option('-F, --from [from-path]', 'copy some file of directory')
    .option('-T, --to [to-path]', 'to necessary slides in project')
    .option('--filter [filter]', 'filter')
    .parse(process.argv);

function help() {
    commander.parse(process.argv);
    if (commander.args.length === 1 || commander.args.length > 3) return commander.help()
}

help();


/**
 * Run
 */

(async () => {
    const fromPath = await getPaths('from');
    const toPath = await getPaths('to');
    const filter = commander.filter || commander.args[3];

    copyToAll(fromPath, toPath, filter)
})();


async function getPaths(type) {

    if (type === 'from') {
        let from;

        if (commander.from || commander.args[0]) {
            from = path.normalize(commander.from || commander.args[0]);

            if (!fs.existsSync(from)) {
                log.error('No such file', from);
                process.exit(0)
            }

            return from;
        } else {
            from = await new fsui({
                startPath: paths.currAssets,
                message: 'Select the file/directory which you want to be put in to slides'
            });

            return from
        }
    }

    if (type === 'to') {
        let to;
        if (commander.from || commander.args[1]) {
            return path.normalize(commander.from || commander.args[1]);
        } else {
            to = await new fsui({
                startPath: paths.currSlides,
                message: 'Select the path pattern to copy (select directory)',
                isolate: true
            });

            if (!fs.lstatSync(to).isDirectory()) {


                log.error('You must select directory!');
                process.exit(0)
            }
            return to
        }
    }
}
