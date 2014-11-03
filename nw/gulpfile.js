var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var partialify = require('partialify');

// var NwBuilder = require('node-webkit-builder');
// var Path = require('path');
// var fs = require('fs');
// var info = require('./package.json');

var jsPath = './app/**/*';
var cssPath = './app/css/**/*.scss';
var sniffPath = '../sniffer/build/forNW/Release/*';

var builderOptions = {
  version: '0.10.2',
  buildType: 'versioned',
  files: [ './public/**'],
  buildDir: './dist',
  platforms: ['osx'],
  macIcns: './icons/pbjs.icns'
};
// var binaryDir = Path.join(builderOptions.buildDir, info.name + " - v" + info.version, 'osx');

function build (cb) {
  var nw = new NwBuilder(builderOptions);

  nw.on('log', console.log);
  console.log(binaryDir);
  nw.build().then(function () {

    fs.renameSync(binaryDir + '/node-webkit.app', binaryDir + '/pbjs.app');
    console.log('Build created');
    cb();
  }).catch(function (error) {
    console.error(error);
  });

}

gulp.task('browserify', function() {
  var bundleStream = browserify('./app/main.js')
    .transform(partialify)
    .bundle();

  bundleStream
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('css', function() {
  gulp.src(cssPath)
    .pipe(concat('main.css'))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('sniffer', function() {
  gulp.src(sniffPath)
    .pipe(gulp.dest('./public/sniffer/'));
});


gulp.task('watch', function() {
  gulp.watch(jsPath, ['browserify']);
  gulp.watch(cssPath, ['css']);
  gulp.watch(sniffPath, ['sniffer']);
});
// gulp.task('build',build);
// gulp.task('default',['build']);
gulp.task('default', ['sniffer','css', 'browserify', 'watch']);
