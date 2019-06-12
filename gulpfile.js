const gulp = require("gulp");
const eslint = require("gulp-eslint");
const terser = require("gulp-terser");

let paths = {
	js: "public/src",
	example: "public/example",
	dist: "public/dist"
};

// gulp 4부터는 function이 비동기적으로 돌아감을 알려줘야 하는데, 그 방법 중 하나가 콜백 파라미터 done을 넣는 방법이 있다.
function test(done) {
	console.log("Test gulp!");
	done();
}

function buildjs() {
	return gulp.src(paths.js + "/*.js")
		.pipe(eslint({
			envs: [ "browser" ]
		}))
		.pipe(eslint.failAfterError())
		.pipe(terser())
		.pipe(gulp.dest(paths.dist + "/"));
}

exports.buildjs = buildjs;
exports.default = test;
