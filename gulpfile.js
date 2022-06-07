let project_folder = "dist";
let source_folder = "#src";

let path = {
	build:{
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/",
	},
	src:{
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/script.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.ttf",
	},
	watch:{
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	clean: "./" + project_folder + "/"
}



let { src, dest } = require('gulp'),                   
gulp = require('gulp'),                              // Gulp
browsersync = require("browser-sync").create(),      // Cервер
fileinclude = require("gulp-file-include"),          // Склеивание HTML файлов
del = require("del"),                                // Удаление папки
scss = require('gulp-sass')(require('sass')),         // Препрос SCSS
autoprefixer = require('gulp-autoprefixer'),          // Автопрефиксер
group_media = require('gulp-group-css-media-queries'),  // Медиа формирование
clean_css = require('gulp-clean-css'),                // Сжатие CSS файлов
rename = require('gulp-rename'),                      // Переименование файлов
uglify = require('gulp-uglify-es').default,          // Сжатие js
imagemin = require('gulp-imagemin'),                 //gulp-imagemin@^7.1.0
webp = require('gulp-webp'),                        // Меняет формат картинки
webphtml = require('gulp-webp-html')         //Подключение вебп картинки
// webpcss = require('gulp-webpcss')


                        	  // Сервер функция
function browserSync() {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}
// HTML Функция
function html() {
	return src(path.src.html)
	.pipe(fileinclude())
	.pipe(webphtml())
	.pipe(dest(path.build.html))
	.pipe(browsersync.stream())
}
 

                                 // CSS Функция
function css() {
	return src(path.src.css)
		.pipe(
			scss({
				outputStyle: "expanded" 
			})
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				ovverrideBrowserlist: ["last 3 version"],
				cascade: true
			}))
		// .pipe(webpcss())
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}


                                 // JS Функция
function js() {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(rename({
			extname: ".min.js"
		}))
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

function images() {
	return src(path.src.img)
	.pipe(
		webp({
			quality: 70
		})
	)
	.pipe(dest(path.build.img))
	.pipe(src(path.src.img))
	.pipe(
		imagemin({
			progressive: true,
			svgoPlugins: [{ removeVievBox: false }],
			interlaced: true,
			optimizationLevel: 3
		})
	)
	.pipe(dest(path.build.img))
	.pipe(browsersync.stream())
}




                          // Слежка за файлами Функция
function watchFile() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
}

                             // Чистка папки Функция
function clean() {
	return del(path.clean)
}

// Сценарий
let build = gulp.series(clean, gulp.parallel(js, css, html, images));
let watch = gulp.parallel(build, watchFile, browserSync);



exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
