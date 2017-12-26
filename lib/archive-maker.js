const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const config = require('../lib/main');

const log = config.log;
const paths = config.paths;
const methods = config.methods;

const progName = 'archive-maker';

module.exports = (slides) => {
    return new Promise((resolve, reject) => {

        let iter = 0;

        methods.mkDir(paths.currentPath, paths.build);

        slides.forEach(slidePath => {
            const outFileName = slidePath.split('\\').pop() + '.zip';
            const outFilePath = path.resolve(paths.currBuild, outFileName);

            // create a file to stream archive data to.
            const output = fs.createWriteStream(outFilePath);
            const archive = archiver('zip', {
                zlib: {level: 9} // Sets the compression level.
            });

            // listen for all archive data to be written
            // 'close' event is fired only when a file descriptor is involved
            output.on('close', function () {
                iter++;
                log.program.message(progName, outFileName, archive.pointer() / 1000 + ' Kbytes')

                if (iter === slides.length) {
                    console.log();
                    log.program.success(progName, 'Arhives created');
                    resolve()
                }
            });

            // This event is fired when the data source is drained no matter what was the data source.
            // It is not part of this library but rather from the NodeJS Stream API.
            // @see: https://nodejs.org/api/stream.html#stream_event_end
            output.on('end', function () {
                console.log('Data has been drained');
            });

            // good practice to catch warnings (ie stat failures and other non-blocking errors)
            archive.on('warning', function (err) {
                if (err.code === 'ENOENT') {
                    // log warning
                } else {
                    // throw error
                    reject(err)
                }
            });

            // good practice to catch this error explicitly
            archive.on('error', function (err) {
                reject(err)
            });

            // pipe archive data to the file
            archive.pipe(output);

            // append files from a sub-directory, putting its contents at the root of archive
            archive.directory(slidePath, false);

            // finalize the archive (ie we are done appending files but streams have to finish yet)
            // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
            archive.finalize();
        })
    })
}