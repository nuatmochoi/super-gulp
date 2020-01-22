import gulp from "gulp";
import gpug from "gulp-pug";
import del from "delete";
import ws from "gulp-webserver";
import image from "gulp-image";
import sass from "gulp-sass"; //css
import autop from "gulp-autoprefixer";
import miniCSS from "gulp-csso"; // minimize css
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages-with-updated-gift";

sass.compiler = require("node-sass");

const routes = {
  pug: {
    watch: "src/**/*.pug", //watch changing of files in src
    src: "src/*.pug",
    dest: "build"
  },
  img: {
    src: "src/img/*",
    dest: "build/img"
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css"
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js"
  }
};

const pug = () =>
  gulp
    .src(routes.pug.src)
    .pipe(gpug())
    .pipe(gulp.dest(routes.pug.dest));

const clean = () => del(["build/", ".publish"]);

const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));

const img = () =>
  gulp
    .src(routes.img.src)
    .pipe(image())
    .pipe(gulp.dest(routes.img.dest));

const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autop({
        browsers: ["last 2 versions"]
      })
    )
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transfrom: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }]
        ]
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const ghdeploy = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, img]); //initializing

const assets = gulp.series([pug, styles, js]); // middle : taking something regarding pug

const postDev = gulp.parallel([webserver, watch]); // when changing occurs

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, postDev]);
export const deploy = gulp.series([build, ghdeploy, clean]);
