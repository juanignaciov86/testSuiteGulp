## Installation

Clone this repo and run npm install to get dependencies

## Short Explanation

Run gulp test, this will do a couple of tasks.
The first task is called coverage, that have two task dependencies,
first dependency task is Instrument, that, as its name says, it will instrument the source.
Second dependency task is Inject, it will inject the instrumented source and tests in the html test runner template,
that is needed to generate the coverage report with the plugin gulp-mocha-phantomjs, its use the npm package mocha-phantomjs-istanbul who collects coverage data and saves it to a
.json file for further processing with gulp-istanbul-report, it will convert into a html coverage report file.
The second task of main test task, is injectRunner, that will inject in the html test runner template the original source, not instrumented, and tests,
we need the original because usually we have to debug the code in the browser.
After gulp test run, we're going to have the coverage directory, with the reports, and the runner populated with sources and tests.
