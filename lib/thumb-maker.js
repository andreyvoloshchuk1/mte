const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const ProgressBar = require('progress');
const resizeImg = require('resize-img');
const sharp = require('sharp');
const config = require('../lib/main');
const Nightmare = require('./nightmare-ewait');

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
    this.screenSize = options.screenSize;
    this.screensData = this.getAllScreensInfo(slides);

    this.bar = new ProgressBar(' :bar :percent', {
      width: 25,
      complete: '\u001b[42m \u001b[0m',
      incomplete: '\u001b[44m \u001b[0m',
      total: this.screensData.length,
    });
  }

  async run() {
    log.program.message(progName, 'Creating screens...');

    for (let slide of this.screensData) {
      try {
        await this.screen(slide);
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    }

    log.program.success(progName, 'All Thumbnails created.');
  }

  screen(slide) {
    return new Promise((resolve, reject) => {
      const nightmare = new Nightmare({
        useContentSize: true,
        enableLargerThanScreen: true,
        width: this.screenSize.width,
        height: this.screenSize.height,
        show: false,
        webPreferences: {
          webaudio: false,
          webSecurity: false,
        },
      });

      nightmare
        .goto(slide.url)
        .ewait('dom-ready')
        .screenshot()
        .then(buffer => {
          fse.ensureDirSync(path.parse(slide.thumb).dir);

          sharp(buffer)
            .ignoreAspectRatio()
            .resize(this.thumbSize.width, this.thumbSize.height)
            .toFile(slide.thumb)
            .then(() => {
              console.log('\n');
              log.program.message(progName, `Thumb created: ${path.relative(config.paths.build, slide.thumb)}`);
              this.bar.tick();
              resolve();
            })
            .catch(err => {
              console.log(`Error in Thumb Maker: \n${err}`);
              reject();
              process.exit(0)
            });
        })
        .catch(err => reject(err))
    })
  }

  getAllScreensInfo(slides) {
    return slides.map(slidePath => ({
      url: `file:///${slidePath}/index.html`.replace(/\\/g, '/'),
      thumb: path.resolve(slidePath, 'media', 'images', 'thumbnails', `${this.name}.${this.format}`),
    }));
  }
};
