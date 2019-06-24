const gulp = require("gulp");
const eslint = require("gulp-eslint");
const terser = require("gulp-terser");

let paths = {
	js: "public/src",
	example: "public/example",
	dist: "public/dist"
};

function syntax(cb) {
	gulp.src(paths.js + "/*.js")
		.pipe(eslint({ envs: [ "browser" ] }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
	cb();
}

function syntaxForTest(cb) {
	gulp.src(paths.js + "/*.js")
		.pipe(eslint({ 
			envs: [ "browser" ], 
			// console 사용된 코드를 무시한다.
			rules: { "no-console": "off" } 
		}))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
	cb();
}

function minify(cb) {
	gulp.src(paths.js + "/*.js")
		.pipe(terser())
		.pipe(gulp.dest(paths.dist + "/"));
	cb();
}

function copySourceForTest(cb) {
	gulp.src(paths.js + "/*.js").pipe(gulp.dest("/www/web/tsart/js/"));
	cb();
}

function copyExampleForTest(cb) {
	gulp.src(paths.example + "/*.html").pipe(gulp.dest("/www/web/tsart/"));
	cb();
}

exports.build = gulp.series(syntax, minify);
exports.default = gulp.series(syntaxForTest, copySourceForTest, copyExampleForTest);
