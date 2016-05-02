var path = require('path');
var del = require('del');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// set variable via $ gulp --type production
var environment = $.util.env.type || 'development';
var isProduction = environment === 'production' || environment === 'prod';

var port = $.util.env.port || 2359;
var app = 'app/';
var dist = 'public/';

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

gulp.task('styl', function (cb) {
  return gulp.src(app + 'styl/app.styl')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.stylus({
      compress: isProduction,
      'include css': true
    }))
    .pipe($.autoprefixer({ browsers: autoprefixerBrowsers }))
    .pipe(gulp.dest(dist + 'css/'))
    .pipe($.size({ title: 'css' }))
    .pipe($.connect.reload());
});

gulp.task('html', function () {
  return gulp.src(app + '*.html')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe(gulp.dest(dist))
    .pipe($.size({ title: 'html' }))
    .pipe($.connect.reload());
});

gulp.task('images', function (cb) {
  return gulp.src(app + 'images/**/*')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.size({ title: 'images' }))
    .pipe(gulp.dest(dist + 'images/'))
    .pipe($.connect.reload());
});

gulp.task('fonts', function (cb) {
  return gulp.src(app + 'fonts/**/*')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.size({ title: 'fonts' }))
    .pipe(gulp.dest(dist + 'fonts/'))
    .pipe($.connect.reload());
});

gulp.task('vendor-js', function () {
  return gulp.src(app + 'vendor/**/*.js')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.concat('vendor.js'))
    .pipe(gulp.dest(dist + 'vendor/'))
    .pipe($.size({ title: 'vendor-js' }))
    .pipe($.connect.reload());
});

gulp.task('vendor-css', function () {
  return gulp.src(app + 'vendor/**/*.css')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest(dist + 'vendor/css/'))
    .pipe($.size({ title: 'vendor-css' }))
    .pipe($.connect.reload());
});

gulp.task('vendor-other', function () {
  return gulp.src(app + 'vendor/**/!(*.js|*.css)')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe(gulp.dest(dist + 'vendor/'))
    .pipe($.size({ title: 'vendor-other' }))
    .pipe($.connect.reload());
});

gulp.task('scripts', function () {
  return gulp.src(app + 'scripts/**/*')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe(isProduction ? $.uglify() : $.util.noop())
    .pipe(gulp.dest(dist + 'js/'))
    .pipe($.size({ title: 'js' }))
    .pipe($.connect.reload());
});

gulp.task('jade', function () {
  return gulp.src(app + '*.jade')
    .pipe(!isProduction ? $.plumber() : $.util.noop())
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest(dist))
    .pipe($.connect.reload());
});

gulp.task('serve', function () {
  $.connect.server({
    root: dist,
    port: port,
    livereload: {
      port: 35729
    }
  });
});

gulp.task('clean', function (cb) {
  return del([dist], { force: true }, cb);
});

gulp.task('watch', function () {
  gulp.watch(app + 'styl/**/*.styl', ['styl']);
  gulp.watch(app + '**/*.jade', ['jade']);
  gulp.watch(app + 'scripts/**/*.js', ['scripts']);
  gulp.watch(app + 'images/**/*', ['images']);
  gulp.watch(app + 'fonts/**/*', ['fonts']);
  gulp.watch(app + 'vendor/**/*.js', ['vendor-js']);
  gulp.watch(app + 'vendor/**/*.css', ['vendor-css']);
  gulp.watch(app + 'vendor/**/!(*.js|*.css)', ['vendor-other']);
});

// Clean, build (development) then serve & watch
gulp.task('default', ['clean'], function () {
  gulp.start([
    'images',
    'fonts',
    'vendor-js',
    'vendor-css',
    'vendor-other',
    'jade',
    'styl',
    'scripts',
    'serve',
    'watch'
  ]);
});

// Clean, then build (production)
gulp.task('build', ['clean'], function () {
  gulp.start([
    'images',
    'fonts',
    'vendor-js',
    'vendor-css',
    'vendor-other',
    'jade',
    'styl',
    'scripts'
  ]);
});
