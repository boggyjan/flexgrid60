'use strict';

// requires
var gulp         = require('gulp');
var connect      = require('gulp-connect');
var ejs          = require('gulp-ejs');
var rmHtmlComm   = require('gulp-remove-html-comments');
var rmEmptyLn    = require('gulp-remove-empty-lines');
var prettify     = require('gulp-html-prettify');
var htmlhint     = require("gulp-htmlhint");
var imagemin     = require('gulp-imagemin');
var sourcemaps   = require('gulp-sourcemaps');
var rename       = require('gulp-rename');
var gutil        = require('gulp-util');
var del          = require('del');
var sass         = require('gulp-sass');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

// variables
var watching     = false;

// error handler
function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

// tasks
gulp.task('clean', function(cb) {
  return del([!watching ? 'dist' : '']);
});

gulp.task('connect', ['clean'], function() {
  connect.server({
    root: 'dist/',
    port: 8888,
    livereload: true
  });
});

gulp.task('ejs', ['clean'], function () {
  return gulp.src('*.ejs')
        .pipe(ejs({
          // global vars
        }).on('error', gutil.log))
        .pipe(htmlhint())
        .pipe(htmlhint.reporter('htmlhint-stylish'))
        .pipe(htmlhint.failReporter({
          supress: true
        }).on('error', handleError))
        .pipe(rename({extname: '.html'}))
        .pipe(rmHtmlComm())
        .pipe(rmEmptyLn())
        .pipe(prettify({indent_inner_html: true, indent_char: ' ', indent_size: 2, unformatted: ['pre', 'code']}))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
});

gulp.task('css', ['clean'], function() {
  var processors = [
    autoprefixer({browsers: ['last 3 versions']})
  ];

  return gulp.src(['scss/*.scss', '!scss/_*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'})
        .on('error', sass.logError))
        .pipe(postcss(processors))
        .on('error', handleError)
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'))
        .pipe(connect.reload());
});

gulp.task('default',    ['clean', 'connect', 'ejs', 'css', 'watch']);
gulp.task('watch', function() {
  watching = true;
  gulp.watch(['*.ejs'], ['ejs']);
  gulp.watch('scss/*.scss', ['css']);
});