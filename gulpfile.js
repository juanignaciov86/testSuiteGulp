var gulp = require('gulp');
var inject = require('gulp-inject');
var istanbul = require('gulp-istanbul');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var istanbulReport = require('gulp-istanbul-report');

gulp.task('instrument', function () {
	return gulp.src(['src/*.js'])
	// Covering files
		.pipe(istanbul({
			coverageVariable: '__coverage__'
		}))
		// instrumented files will go here
		.pipe(gulp.dest('tests/instrumented/'));
});


gulp.task('coverage', ['instrument', 'inject'], function () {
	return gulp
		.src('index.html', {read: false})
		.pipe(mochaPhantomJS(
			{
				reporter: ["spec"],
				phantomjs: {
					useColors: true,
					hooks: 'mocha-phantomjs-istanbul',
					coverageFile: './coverage/coverage.json'
				}
			}))
		.on('finish', function () {
			gulp.src("./coverage/coverage.json")
				.pipe(istanbulReport({
					reporters: ['text', 'html']
				}));
		});
});




gulp.task('inject', ['instrument'], function (cb) {
    var paths = {
    	"javascript": ["tests/instrumented/*.js"],
    	tests: ["tests/*.js"]
    };
	return gulp.src('index.html')
		.pipe(inject(
			gulp.src(paths.javascript,{read: false}), {
				relative: true
			}))
		.pipe(inject(
			gulp.src(paths.tests, {read: false}), {
				relative: true,
				starttag: "<!-- inject:tests:js -->"
			}))
		.pipe(gulp.dest('.'));
});


gulp.task('injectRunner', function (cb) {
    var paths = {
    	"javascript": ["src/*.js"],
    	tests: ["tests/*.js"]
    };

	return gulp.src('index.html')
		.pipe(inject(
			gulp.src(paths.javascript,{read: false}), {
				relative: true
			}))
		.pipe(inject(
			gulp.src(paths.tests, {read: false}), {
				relative: true,
				starttag: "<!-- inject:tests:js -->"
			}))
		.pipe(gulp.dest('.'));
});

gulp.task('test', ['coverage', 'injectRunner'], function () {
	return gulp
		.src('index.html', {read: false})
		.pipe(mochaPhantomJS(
			{
				reporter: ["spec"],
                phantomjs: {
					useColors: true
				}
			}));
});
