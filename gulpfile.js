const gulp = require("gulp");
const webpack = require("webpack-stream");
const sass = require("gulp-sass");
const server = require("browser-sync").create();
const del = require("del");

const dist = "C:/OpenServer/domains/react-admin/admin";

gulp.task("copy-html", () => {
  return gulp
    .src("./app/src/index.html")
    .pipe(gulp.dest(dist))
    .pipe(server.stream());
});

gulp.task("build-js", () => {
  return gulp
    .src("./app/src/main.js")
    .pipe(
      webpack({
        mode: "development",
        output: {
          filename: "script.js",
        },
        watch: false,
        devtool: "source-map",
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [
                    [
                      "@babel/preset-env",
                      { debug: false, corejs: 3, useBuiltIns: "usage" },
                    ],
                    "@babel/react",
                  ],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(gulp.dest(dist))
    .pipe(server.stream());
});

gulp.task("build-sass", () => {
  return gulp
    .src("./app/scss/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(dist))
    .pipe(server.stream());
});

gulp.task("clear-api", () => {
  return del(dist + "/api", { force: true });
});

gulp.task("copy-api", () => {
  return gulp.src("./app/api/**/*.*").pipe(gulp.dest(dist + "/api"));
});

gulp.task("clear-assets", () => {
  const path = dist + "/assets";
  console.log(path);
  return del(path, { force: true });
});

gulp.task("copy-assets", () => {
  return gulp
    .src("./app/assets/**/*.*")
    .pipe(gulp.dest(dist + "/assets"))
    .pipe(server.stream());
});

gulp.task("watch", () => {
  server.init({
    server: {
      baseDir: "C:/OpenServer/domains/react-admin",
    },
    notify: false,
    host: "localhost",
    post: 3000,
  });

  gulp.watch("./app/src/*.html", gulp.parallel("copy-html"));
  gulp.watch("./app/src/**/*.js", gulp.parallel("build-js"));
  gulp.watch(".app/scss/**/*.scss", gulp.parallel("build-sass"));
  gulp.watch("./app/api/**/*.*", gulp.series("clear-api", "copy-api"));
  gulp.watch("./app/assets/**/*.*", gulp.series("clear-assets", "copy-assets"));
});

gulp.task(
  "build",

  gulp.parallel(
    "copy-html",
    gulp.series("clear-assets", "copy-assets"),
    gulp.series("clear-api", "copy-api"),
    "build-sass",
    "build-js"
  )
);

gulp.task("default", gulp.parallel("watch", "build"));
