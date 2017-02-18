var gulp = require('gulp');
var inject = require('gulp-inject');
var istanbul = require('gulp-istanbul');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var istanbulReport = require('gulp-istanbul-report');
var fs = require('fs');

var walkSync = function(dir) {
	var filelist = [];
	var fs = fs || require('fs'),
	files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function(file) {
		if (fs.statSync(dir + file).isDirectory()) {
			filelist = walkSync(dir + file + '/', filelist);
		}
		else {
			if(file.indexOf("Test") !== -1) {
				var srcName ="./src/" +  file.replace(/test/i,"");
				filelist.push(srcName);
			}
		}
	});
	return filelist;
};

gulp.task('instrument', function () {
	var paths = walkSync("./tests/");

	return gulp.src(paths)
	// Covering files
		.pipe(istanbul({
			coverageVariable: '__coverage__'
		}))
		// instrumented files will go here
		.pipe(gulp.dest('coverage/instrumented/'));
});


gulp.task('coverage', ['instrument', 'inject'], function () {
	return gulp
		.src('testRunner.html', {read: false})
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
    	"javascript": ["coverage/instrumented/*.js"],
    	tests: ["tests/*.js"]
    };

	return gulp.src('testRunner.html')
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
		"javascript": [],
		tests: ["tests/*.js"]
	};
	paths.javascript = walkSync("./tests/");
	return gulp.src('testRunner.html')
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
		.src('testRunner.html', {read: false})
		.pipe(mochaPhantomJS({
			reporter: ["spec"],
            phantomjs: {
				useColors: true
			}
		}));
});
