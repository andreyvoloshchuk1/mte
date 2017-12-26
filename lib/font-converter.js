const path = require('path');
const Fontmin = require('fontmin');
const chalk = require('chalk');

const config = require('../lib/main');

const methods = config.methods;
const paths = config.paths;
const log = config.log;

const fontsDirInAssets = path.resolve(paths.currAssets, 'fonts');
const fontsFileInGlobal = path.resolve(paths.currGlobal, 'style', 'fonts.scss');

class FontsConverter {
    constructor() {
        this.folderEmpty = methods.getFiles(fontsDirInAssets).length === 0;
        this.run();
    }

    run() {
        if (this.folderEmpty) {
            log.warning('Fonts folder is empty!');
        } else {
            this.otftottf();
        }
    }

    otftottf() {
        new Fontmin()
            .src(fontsDirInAssets + '/*.*otf')
            .use(Fontmin.otf2ttf())
            .dest(fontsDirInAssets)
            .run(err => {
                if (err) return console.error(err);
                this.ttftowoff();
            });
    }

    ttftowoff() {
        new Fontmin()
            .src(fontsDirInAssets + '/*.ttf')
            .use(Fontmin.ttf2woff())
            .dest(fontsDirInAssets)
            .run(err => {
                if (err) return console.error(err);
                this.createFontScss()
            });
    }

    createFontScss() {
        const fonts = methods.getFiles(fontsDirInAssets);
        let commands = '@import "presentation-style-config";\n\n';

        fonts.forEach(font => {
            const ext = font.split('.').pop();

            // delete if ext in't '.woff'
            if (ext !== 'woff') {
                methods.rmDir(fontsDirInAssets, font)
            }

            // Check if font name have whitespaces
            if (/\s/g.test(font)) {
                log.error(`Yon can't use whitespaces in name of font:`, path.resolve(fontsDirInAssets, font));
            }

            if (ext === 'woff') {
                // Remove file extension
                const fontName = font.replace(/(.woff)$/, '');

                // Add connecting command in 'fonts.scss'
                commands += `@include font-face(${fontName}, '../fonts/${fontName}', null, null, woff);\n`;
            }
        });

        // Create file 'fonts.scss'
        methods.mkFile(fontsFileInGlobal, commands);

        // Show final message after creating
        log.success('Fonts converted and connected in:', path.resolve(paths.currGlobal, 'style', 'fonts.scss'));
    }
}

module.exports = FontsConverter;