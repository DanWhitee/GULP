let project_folder = "dist";
let source_folder = "#src";

let fs = require('fs');

//Пути к необходимым папкам
let path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		images: project_folder + "/images/",
		fonts: project_folder + "/fonts/",
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/script.js",
		images: source_folder + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.ttf",
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		images: source_folder + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	clean: "./" + project_folder + "/"
}

//Переменные
const {
	src,
	dest
} = require('gulp');
const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'));
const browsersync = require('browser-sync').create();
const concat = require('gulp-concat');
const filInclude = require('gulp-file-include');
const del = require('del');
const autoPrefixer = require('gulp-autoprefixer');
const mediaqueries = require('gulp-group-css-media-queries');
const uglifyes = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const imagesmin = require('gulp-imagemin');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');



//Работа со html!
function html() {
	return src(path.src.html) //Находим корневой файл
		.pipe(filInclude()) // Используем плагин 'filInclude', чтобы соеденить все html файлы 
		.pipe(dest(path.build.html)) // Выгружаем в необходимую папку с помощью встроенной штуки dest
		.pipe(browsersync.stream()) // Автоматически перезагружаем странику браузенра
};

//Работа со стилями!
function styles() {
	return src(path.src.css) //Находим корневой файл
		.pipe(concat('style.min.css')) //Переименовываем файл с помощью плагина 'concat'
		.pipe(mediaqueries()) ///Используем плагин 'gulp-group-css-media-queries' чтобы собрать разброшенные media запросы и поместить их  в конец стилей 
		.pipe(autoPrefixer({
			overrideBrowserslist: ["last 5 versions"], //Используем плагин 'gulp-autoprefixer', чтобы все браузеры понимали стили
			cascade: true
		}))
		.pipe(sass({
			outputStyle: 'compressed'
		})) // Минифицируем файл
		.pipe(dest(path.build.css)) // Выгружаем в необходимую папку с помощью встроенной штуки dest
		.pipe(browsersync.stream()) // Автоматически перезагружаем странику браузенра
};

//Работа со скриптом!
function script() {
	return src(path.src.js) //Находим корневой файл
		.pipe(filInclude()) // Используем плагин 'filInclude', чтобы соеденить все html файлы 
		.pipe(babel({
			presets: ['@babel/env'], //Обрабатывает js и делает его читаемым для всех браузеров
		}))
		.pipe(concat('script.min.js')) //Переименовываем файл с помощью плагина 'concat'
		.pipe(uglifyes()) //С помощью плагина 'gulp-uglify-es' минифицирую файлы js
		.pipe(dest(path.build.js)) // Выгружаем в необходимую папку с помощью встроенной штуки dest
		.pipe(browsersync.stream()) // Автоматически перезагружаем странику браузенра
};

//Работа со изображениями!
function images() {
	return src(path.src.images) //Находим корневой файл
		.pipe(imagesmin({
			interlaced: true,
			progressive: true,
			optimizationLevel: 3,
			svgoPlugins: [{
				removeViewBox: true
			}]
		}))
		.pipe(dest(path.build.images)) // Выгружаем в необходимую папку с помощью встроенной штуки dest
		.pipe(browsersync.stream()) // Автоматически перезагружаем странику браузенра
};

//Работа со sprite svg
gulp.task('svgSprite', function () {
	return gulp.src([source_folder + '/iconsprite/**/*.svg'])
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../icons/icons.svg',
					example: true
				}
			}
		}))
		.pipe(dest(path.build.images)) // Выгружаем в необходимую папку с помощью встроенной штуки dest
})


//Работа со шрифтами!
function fonts() {
	src(path.src.fonts) //Находим корневой файл
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts)) // Выгружаем в необходимую папку с помощью встроенной штуки dest
	return src(path.src.fonts) //Находим корневой файл 
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts)) // Выгружаем в необходимую папку с помощью встроенной штуки dest
};

function fontsStyle() {
	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

function cb() {}


//Работа с Live транслятором
function browserSync() {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	});
};

//Прослушка необходимый фалов. Чтобы все было динамично
function watchFile() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], styles);
	gulp.watch([path.watch.js], script);
	gulp.watch([path.watch.images], images);

};

//Функия, которая чистит папку dist
function clean() {
	return del(path.clean);
};


let build = gulp.series(clean, gulp.parallel(html, styles, script, images, fonts), fontsStyle) // Удаление папки dist / Выполнение функции html / Выполнение функции styles
let watch = gulp.parallel(build, watchFile, browserSync);


// Экспартируем необходимые штуки галпу
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.script = script;
exports.html = html;
exports.styles = styles;
exports.build = build;
exports.watch = watch;
exports.default = watch;
