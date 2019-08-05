const gulp = require("gulp");
const eslint = require("gulp-eslint");
const terser = require("gulp-terser");
const stripdebug = require("gulp-strip-debug");

let paths = {
    js: "public/src",
    example: "public/example",
    docs: "public/document",
    dist: "public/dist"
};

function syntax(cb) {
    gulp.src(paths.js + "/*.js")
        .pipe(stripdebug())
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
        .pipe(stripdebug())
        .pipe(terser())
        .pipe(gulp.dest(paths.dist + "/"));
    cb();
}

function copySourceForTest(cb) {
    gulp.src(paths.js + "/*.js").pipe(gulp.dest("/var/www/html/tsart/example/js/"));
    cb();
}

function copyExampleForTest(cb) {
    gulp.src(paths.example + "/*.html").pipe(gulp.dest("/var/www/html/tsart/example/"));
    cb();
}

function deployDocument(cb) {
    gulp.src(paths.docs + "/**").pipe(gulp.dest("/var/www/html/tsart/document/"));
    cb();
}

function deploy(cb) {
    gulp.src(paths.js + "/*").pipe(gulp.dest("/var/www/html/tsart/document/tsart/")); 
    cb();
}

function deployMinified(cb) {
    gulp.src(paths.dist + "/*").pipe(gulp.dest("/var/www/html/tsart/document/tsart/")); 
    cb();
}

exports.build = gulp.series(syntax, minify);
exports.puredocs = gulp.series(deploy, deployDocument);
exports.docs = gulp.series(syntax, minify, deployMinified, deployDocument);
exports.onlydocs = gulp.series(deployDocument);
exports.default = gulp.series(syntaxForTest, copySourceForTest, copyExampleForTest);
