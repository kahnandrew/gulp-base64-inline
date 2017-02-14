var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var util = require('gulp-util');

module.exports = function (givenImagesPath) {
    function base64Inline (file, enc, callback) {
        var imagesPath;

        if (!givenImagesPath) {
            imagesPath = path.dirname(file.path);
        } else {
            imagesPath = path.join(path.dirname(file.path), givenImagesPath);
            if (path.resolve(givenImagesPath) === path.normalize(givenImagesPath)) {
                imagesPath = givenImagesPath;
            }
        }

        // Do nothing if no contents
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            // accepting streams is optional
            this.emit('error', new gutil.PluginError('gulp-inline-base64', 'Stream content is not supported'));
            return callback();
        }

        function inline (match, group1, group2, group3) {
          util.log(match)
          util.log(group1)
          util.log(group2)
          util.log(group3)
            var imagePath = group2;
            try {
                var fileData = fs.readFileSync(path.join(imagesPath, imagePath));
            }
            catch (e) {
                gutil.log(gutil.colors.yellow('base64-inline'), 'Referenced file not found: ' + path.join(imagesPath, imagePath));
                gutil.log(gutil.colors.yellow('base64-inline'), 'Leaving it as is.');
                return inlineExpr;
            }

            var fileBase64 = new Buffer(fileData).toString('base64');
            var fileMime = mime.lookup(imagePath);
            var result = '<img' + group1 + 'src="data:' + fileMime  + ';base64,' + fileBase64 + '"' + group3 + '>';

            console.log(result);
            return result;
        }

        // check if file.contents is a `Buffer`
        if (file.isBuffer()) {
            var base64 = String(file.contents).replace(/<img(.*)src=["']([^"']*)["']([^>]*)>/g, inline);
            file.contents = new Buffer(base64);

            this.push(file);
        }

        return callback();
    }

    return through.obj(base64Inline);
};
