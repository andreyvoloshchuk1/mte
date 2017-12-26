const path = require('path');
const eachSlide = require('../lib/each-slide');
const config = require('../lib/main');

const log = config.log;
const paths = config.paths;
const methods = config.methods;
const variables = config.variables;

const projectData = require(path.resolve(paths.currentPath, variables.clmInfoFileName));
const navigationData = require(path.resolve(paths.currentPath, variables.navDataFileName));

/*
 Slides and Flows data get's from 'clm-info.json' because user can add/del slides with this module,
 but user can't add/del flows or lang directories, sometimes user delete flow or lang directories manual,
 then LangData get's by getDirectory method
 */

class structureChanger {
    constructor(flow, slide, mode, slideName, flowName) {
        this.flowNum = flow;
        this.slideNum = slide;
        this.mode = mode;
        this.slideName = slideName;
        this.flowName = flowName ? flowName : false;
        // this.slides = eachSlide.getSlidesPaths();
        this.dataFlow = projectData.clm.flowNumber;
        this.dataSlide = projectData.clm[`numberSlideInFlow-${flow}`];

        this.run();
    }

    run() {
        this.validateInput();
        // this.changeProjectData();
        this.changeNavigationData();
    }

    changeProjectData() {
        let newData = projectData;
        const slideKey = `numberSlideInFlow-${this.dataFlow}`;

        if (this.mode === 'add')
            newData.clm[slideKey] = (+projectData.clm[slideKey] + 1).toString();

        if (this.mode === 'del')
            newData.clm[slideKey] = (+projectData.clm[slideKey] - 1).toString();

        methods.mkFile(path.resolve(paths.currentPath, variables.clmInfoFileName), JSON.stringify(newData, null, '  '))
    }

    changeNavigationData() {
        let newData = navigationData;

        for (let lang in navigationData) {
            for (let flow in navigationData[lang]) {
                // Add slide data if Flow
                if (flow === `Flow-${this.flowNum}`) {
                    let slideData = {
                        id: navigationData[lang][flow][this.slideNum - 1].id,
                        name: this.slideName
                    };

                    if (this.flowName) slideData.flow_name = this.flowName;

                    // Rewrite slides data beyond added slide
                    navigationData[lang][flow].forEach((slide, index) => {
                        if (index >= this.slideNum - 1) {
                            const suffix = index < 10 ? 'sl_0' : 'sl_';
                            let newID= slide.id.split('_');
                            newID.pop();
                            newID.pop();
                            newID.push(suffix + (index + 2));
                            newID = newID.join('_');
                            newData[lang][flow][index].id = newID;

                            if (this.slideNum === '1') {
                                delete newData[lang][flow][index].flow_name;
                            }
                        }
                    });
                    newData[lang][flow].splice(this.slideNum - 1, 0, slideData);
                }
            }
        }
        methods.mkFile(path.resolve(paths.currentPath, 'res.json'), JSON.stringify(newData, null, '  '))
    }

    validateInput() {
        if (this.flowNum > this.dataFlow) {
            log.error(`Wrong flow number`, `You pass: ${this.flowNum}\n  In your project flows: ${this.dataFlow}`);
            process.exit(0)
        }

        if (this.slideNum > this.dataSlide) {
            log.error(`Wrong slide number in Flow-${this.flowNum}`, `You pass: ${this.slideNum}\n  In Flow-${this.flowNum} you have: ${this.dataSlide}`);
            process.exit(0)
        }
    }
}

module.exports = structureChanger;
