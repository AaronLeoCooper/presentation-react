var path = require('path');
var del = require('del');
var gulp = require('gulp');
var webpackStream = require('webpack-stream');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

// set variable via: gulp --type=production
var environment = $.util.env.type || 'development';
var isProduction = environment === 'production' || environment === 'prod';
var webpackConfig = require('./webpack.config.js').getConfig(environment);

var port = $.util.env.port || 2359;
var autoreload = true;

var root = __dirname;
var dev = root + '/app/';
var dist = root + '/public/';

var folders = {
  stylus:       [dev + 'styl',    dist + 'css'],
  scripts:      [dev + 'scripts', dist + 'js'],
  images:       [dev + 'images',  dist + 'images'],
  fonts:        [dev + 'fonts',   dist + 'fonts'],
  jade:         [dev + '',        dist + ''],
  vendorJs:     [dev + 'vendor',  dist + 'vendor'],
  vendorCss:    [dev + 'vendor',  dist + 'vendor/css'],
  vendorOther:  [dev + 'vendor',  dist + 'vendor'],
};

var scriptFiles = {
  webpackEntry: [dev + '/app.js'],
  webpackAll: [folders.scripts[0] + '/**/*.js']
};

var autoprefixerBrowsers = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 6',
  'opera >= 23',
  'ios >= 6',
  'android >= 4.4',
  'bb >= 10'
];

// Stylus
gulp.task('styl', function (cb) {
  return gulp.src(folders.stylus[0] + '/app.styl')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.stylus({
      compress: isProduction,
      'include css': true
    }))
    .pipe($.autoprefixer({ browsers: autoprefixerBrowsers }))
    .pipe(gulp.dest(folders.stylus[1] + '/'))
    .pipe($.size({ title: 'styles' }))
    .pipe($.connect.reload());
});

// Images
gulp.task('images', function (cb) {
  return gulp.src(folders.images[0] + '/**/*')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe(gulp.dest(folders.images[1] + '/'))
    .pipe($.size({ title: 'images' }))
    .pipe($.connect.reload());
});

// Fonts
gulp.task('fonts', function (cb) {
  return gulp.src(folders.fonts[0] + '/**/*')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe(gulp.dest(folders.fonts[1] + '/'))
    .pipe($.size({ title: 'fonts' }))
    .pipe($.connect.reload());
});

// Webpack (scripts)
gulp.task('webpack', function (cb) {
  return gulp.src(scriptFiles.webpackEntry)
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe(webpackStream(webpackConfig))
    .pipe(gulp.dest(folders.scripts[1] + '/'))
    .pipe($.size({ title: 'webpack' }))
    .pipe($.connect.reload());
});

// Vendor (JS)
gulp.task('vendor-js', function (cb) {
  return gulp.src(folders.vendorJs[0] + '/**/*.js')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.concat('vendor.js'))
    .pipe(gulp.dest(folders.vendorJs[1] + '/'))
    .pipe($.size({ title: 'vendor-js' }))
    .pipe($.connect.reload());
});

// Vendor (CSS)
gulp.task('vendor-css', function (cb) {
  return gulp.src(folders.vendorCss[0] + '/**/*.css')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest(folders.vendorCss[1] + '/'))
    .pipe($.size({ title: 'vendor-css' }))
    .pipe($.connect.reload());
});

// Vendor (Other)
gulp.task('vendor-other', function (cb) {
  return gulp.src(folders.vendorOther[0] + '/**/!(*.js|*.css)')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe(gulp.dest(folders.vendorOther[1] + '/'))
    .pipe($.size({ title: 'vendor-other' }))
    .pipe($.connect.reload());
});

// Jade
gulp.task('jade', function (cb) {
  return gulp.src(folders.jade[0] + '*.jade')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest(folders.jade[1] + '/'))
    .pipe($.connect.reload());
});

// Local server
gulp.task('serve', function (cb) {
  $.connect.server({
    root: dist,
    port: port,
    livereload: {
      port: 35729
    }
  });
  cb();
});

// Clean out public directory
gulp.task('clean', function (cb) {
  return del([dist], { force: true }, cb);
});

// Watchers
gulp.task('watch', function (cb) {
  gulp.watch(folders.stylus[0] + '/**/*.styl', ['styl']);
  gulp.watch(folders.jade[0] + '/**/*.jade', ['jade']);
  gulp.watch(scriptFiles.webpackAll, ['webpack']);
  gulp.watch(folders.images[0] + '/**/*', ['images']);
  gulp.watch(folders.fonts[0] + '/**/*', ['fonts']);
  gulp.watch(folders.vendorJs[0] + '/**/*.js', ['vendor-js']);
  gulp.watch(folders.vendorCss[0] + '/**/*.css', ['vendor-css']);
  gulp.watch(folders.vendorOther[0] + '/**/!(*.js|*.css)', ['vendor-other']);
  cb();
});

// Clean, build (development) then serve & watch
gulp.task('default', ['clean'], function (cb) {
  runSequence('webpack', ['styl', 'images', 'fonts', 'vendor-js', 'vendor-css', 'vendor-other', 'jade'], 'watch', 'serve', cb);
});

// Clean, then build (production)
gulp.task('build', ['clean'], function (cb) {
  runSequence('webpack', ['styl', 'images', 'fonts', 'vendor-js', 'vendor-css', 'vendor-other', 'jade'], cb);
});
