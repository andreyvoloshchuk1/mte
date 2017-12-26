const path = require('path');
const config = require('../lib/main');

const log = config.log;
const paths = config.paths;
const variables = config.variables;

const projectData = require(path.resolve(paths.currentPath, variables.clmInfoFileName));

class structureChanger {
    constructor(flow, slide, filter) {
        this.filter = filter;
        this.flowNum = flow;
        this.slideNum = slide;
    }

}

module.exports = structureChanger;
