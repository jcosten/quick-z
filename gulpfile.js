var gulp = require('gulp'),
    cssnano = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    livereload = require("gulp-livereload"),
    plumber = require('gulp-plumber'),
    angularTemplateCache = require('gulp-angular-templatecache'),
    addStream = require('add-stream'),
    angularFilesort = require('gulp-angular-filesort'),
    watch = require('gulp-watch'),
    gulpif = require('gulp-if'),
    args = require('yargs').argv;

var isRelease = String(args.env).toLowerCase().indexOf('release') > -1 ? true : false;    
console.log("BuildConfiguration: " + String(args.env));
//isRelease = true;

var onError = function (err) {
    console.log(err);
};

gulp.task('AUTO_BUILD', function () {
    watch('app/**/*.js', function () { gulp.start('bundleAppJs') });
    watch('app/**/*.html', function () { gulp.start('bundleAppJs') });
    watch('app/**/*.css', function () { gulp.start('bundleAppCss') });
});

gulp.task('bundleAppJs', function () {
    function prepareTemplates() {
        return gulp.src('app/**/*.html')
          .pipe(angularTemplateCache({ root: '/app/', module: 'app' }));
    }
    function bundleApp() {
        return gulp.src([
         "app/**/*.js",
        ])
      .pipe(plumber({ errorHandler: onError }))
      .pipe(angularFilesort())
    }
    return gulp.src([
        "node_modules/angular/angular.js",
        "node_modules/angular-aria/angular-aria.js",
        "node_modules/angular-animate/angular-animate.js",
        "node_modules/angular-messages/angular-messages.js",
        "node_modules/angular-material/angular-material.js",
        "node_modules/angular-ui-router/release/angular-ui-router.js",
      ]) 
      .pipe(plumber({ errorHandler: onError }))
     .pipe(addStream.obj(bundleApp()))
     .pipe(gulpif(isRelease, addStream.obj(prepareTemplates())))
     .pipe(concat('app.js'))
     .pipe(sourcemaps.init())
     .pipe(gulpif(isRelease, uglify()))
     .pipe(sourcemaps.write('.'))
     .pipe(gulp.dest('dist'));
});
gulp.task('bundleAppCss', function () {
    return gulp.src([ 
    "node_modules/angular/angular-csp.css",
       "node_modules/angular-material/angular-material.css",
       "node_modules/font-awesome/css/font-awesome.css",
       "app/**/*.css"])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(concat('app.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('dist'));
});
gulp.task('copyFonts', function () {
    return gulp.src([
         'node_modules/font-awesome/fonts/*.{ttf,woff,woff2,eof,svg}',
    ]).pipe(gulp.dest('fonts'));
});

gulp.task('default',['bundleAppJs', 'bundleAppCss','copyFonts']);
