const fs = require('fs');
const path = require('path');
const bs = require('browser-sync').create();
const ProgressBar = require('progress');
const resizeImg = require('resize-img');
const webshot = require('webshot');
const config = require('../lib/main');
const eachSlide = require('../lib/each-slide');

const log = config.log;
const paths = config.paths;
const methods = config.methods;

const progName = 'thumbs-maker'; 

module.exports = class thumbMaker {
    constructor(slides, options) {
        this.port = 2905;
        this.name = options.name;
        this.format = options.format;
        this.thumbSize = options.thumbSize;
        this.screensData = this.getAllScreensInfo(slides);
        this.webshotOptions = {
            windowSize: options.screenSize,
            streamType: options.format
        }

        this.bar = new ProgressBar(' :bar :percent', {
            width: 25,
            complete: '\u001b[42m \u001b[0m',
            incomplete: '\u001b[44m \u001b[0m',
            total: this.screensData.length
        });
        this.results = '';
    }

    run() {       
        return new Promise((resolve, reject) => {
            log.program.message(progName, 'Starting server...')    

            bs.init({
                open: false,
                server: {
                    baseDir: paths.currSlides,
                    directory: true,
                },
                port: this.port,
                notify: false,
                ui: false,
                logLevel: 'silent'
            }, () => {

                log.program.success(progName, 'Server ready.', 'Port:'+ this.port)    
                log.program.message(progName, 'Creating screens...')    

                this.screensData.forEach(screen => {
                    const screenFile = path.resolve(screen.path, this.name +'.'+ this.format);

                    webshot(screen.url, screenFile, this.webshotOptions, (err) => {
                        if (err) {
                            log.program.error(progName, 'WEBSHOT ERROR', err);
                            console.log('Created only: ', this.results);    
                            reject(err, this.results);
                        }
                        
                        resizeImg(fs.readFileSync(screenFile), this.thumbSize).then(buffer => {
                            fs.writeFileSync(screenFile, buffer);
                            this.results += '\n' + screenFile;
                            console.log('\x1Bc');
                            log.program.message(progName, this.results)
                            console.log();
                            this.bar.tick();
                            
                            if (this.bar.complete) {
                                bs.exit();
                                console.log();
                                log.program.success(progName, 'Thumbnails created.\n');    
                                resolve(this.results);
                            }
                        })
                    }) 
                })
            })
        })
    }

    getAllScreensInfo(slides) {
        return slides.map(slidePath => {
            const patsParts = slidePath.split('\\'); 
            const prefix = `http://localhost:${this.port}/`;
            const suffix = '/index.html'
            const cutStart = patsParts.indexOf(paths.slides) + 1;
            const urlBody = patsParts.slice(cutStart).join('/');
            return {
                url: prefix + urlBody + suffix,
                path: path.resolve(slidePath, 'media', 'images', 'thumbnails')
            }
        });
    }

    // getAllScreensInfo(langs) {
    //     let thumbsData = [];
    //     langs.forEach(lang => {
    //         eachSlide.onDir(lang, (options) => {
    //             thumbsData.push({
    //                 url: `http://localhost:${this.port}/${options.langDir}/${options.flowDir}/${options.slideDir}/index.html`,
    //                 path: path.resolve(options.slidePath, 'media', 'images', 'thumbnails')
    //             })            
    //         })
    //     });

    //     return thumbsData;
    // }
}
