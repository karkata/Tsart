const gulp = require("gulp");
const eslint = require("gulp-eslint");
const terser = require("gulp-terser");

let paths = {
	js: "public/src",
	example: "public/example",
	dist: "public/dist"
};

function build() {
	return gulp.src(paths.js + "/*.js")
		.pipe(eslint({ envs: [ "browser" ] }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.pipe(terser())
		.pipe(gulp.dest(paths.dist + "/"));
}

function test() {
	gulp.src(paths.js + "/*.js")
		.pipe(eslint({ envs: [ "browser" ] }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.pipe(gulp.dest("/www/web/tsart/js/"));

	return gulp.src(paths.example + "/*.html")
		.pipe(gulp.dest("/www/web/tsart/"));
}

exports.build = build;
exports.default = test;
