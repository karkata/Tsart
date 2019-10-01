const gulp = require("gulp");
const eslint = require("gulp-eslint");
const terser = require("gulp-terser");
const stripdebug = require("gulp-strip-debug");
const fs = require("fs");

const version = "1.0.0";
const dir = "public/dist/" + version + "/";

let paths = {
    js: "public/src",
    example: "test",
    docs: "docs",
    dist: dir 
};

function syntax(cb) {
    gulp.src(paths.js + "/*.js")
        .pipe(stripdebug())
        .pipe(eslint({ envs: [ "browser" ] }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
    cb();
}

function minify(cb) {
    gulp.src(paths.js + "/*.js")
        .pipe(stripdebug())
        .pipe(terser())
        .pipe(gulp.dest(paths.dist + "/"));
    cb();
}

function deployDocument(cb) {
    gulp.src(paths.dist + "/*.js")
        .pipe(gulp.dest(paths.docs + "/tsart/"))
    cb();
}

function testDocumentAtLocal(cb) {
    gulp.src(paths.docs + "/**").pipe(gulp.dest("/var/www/html/tsart/docs/"));
    gulp.src(paths.js + "/*.js")
        .pipe(eslint({ 
            envs: [ "browser" ], 
            rules: { "no-console": "off" } 
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(gulp.dest("/var/www/html/tsart/docs/tsart/"));
    cb();
}

function testExampleAtLocal(cb) {
    gulp.src(paths.example + "/**").pipe(gulp.dest("/var/www/html/tsart/test/"));
    gulp.src(paths.js + "/*.js")
        .pipe(eslint({ 
            envs: [ "browser" ], 
            rules: { "no-console": "off" } 
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(gulp.dest("/var/www/html/tsart/test/js/"));
    cb();
}
    
// Build and make documents
exports.default = gulp.series(syntax, minify, deployDocument);
// Only build
exports.build = gulp.series(syntax, minify);
// Test
exports.testdoc = gulp.series(testDocumentAtLocal);
exports.testexam = gulp.series(testExampleAtLocal);
