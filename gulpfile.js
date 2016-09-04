//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'); //本地安装gulp所用到的地方
var $ = require("gulp-load-plugins")()
    , mergeStream = require("merge-stream")//把多个流合并成一个流
    , cssgrace = require("cssgrace");
module.exports = function(){
    gulp.task('default',[less("less/dashboard.less")]); //定义默认任务
    //gulp.run("default");//通过代码手动启动gulp任务
};
module.exports();//命令行使用gulp的时候使用，如果当做模块使用则注释这句
function less(from, to){
    //定义一个testLess任务（自定义任务名称）
    gulp.task('less', function () {
        //gulp
        //    .src(from || 'less/**/*.less') //该任务针对的文件
        //    .pipe($.less()) //该任务调用的模块
        //    .pipe(gulp.dest(to || 'dist1/css')); //将会在src/css下生成index.css
        return gulp.src(["less/views/dashboard.less","less/components/panels*"])
            .pipe($.concat("base.less"))
            .pipe($.less())
            .pipe(gulp.dest('dest/'))

    });
    return "less";
}
function prefixer(){
    gulp.task('prefixer', function () {
        //autoprefixer 浏览器兼容插件，比如opacity，inline-block
        return gulp.src('src/less/index.less').pipe($.less())
            .pipe($.sourcemaps.init())
            .pipe($.postcss([$.autoprefixer({//自动浏览器前缀插件
                    browsers: ["ie 7-11", "last 20 chrome versions"],
                    cascade: true, //是否美化属性值 默认：true 像这样：
                    remove: true //是否去掉不必要的前缀 默认：true
                })
                , cssgrace ]))
            .pipe($.sourcemaps.write('.'))
            .pipe(gulp.dest('dest/css'));
    });
    return "prefixer";
}
function imagemin(from, to){
    gulp.task("imagemin", function(){
        return gulp.src(from || 'src/images/*')
            .pipe($.imagemin())
            .pipe(gulp.dest(to || 'dist/images'));
    });
    return "imagemin";
}
function sprites(){
    //精灵图
    gulp.task('sprites', function() {
        var spritesmith = require('gulp.spritesmith'), srcAssets = "src";
        var config = {
            src: srcAssets + '/images/*.png',
            dest: {
                css: 'dest/css/',
                image: 'dest/images/'
            },
            options: {
                cssName: 'sprites.css',
                cssFormat: 'css',
                cssOpts: {
                    cssClass: function (item) {
                        return '.aa-';
                    }
                },
                imgName: 'iconc-sprite.png',
                imgPath: '../images/iconc-sprite.png'//合成的精灵图被最终发布的css引用的路径
            }
        };
        var spriteData = gulp.src(config.src).pipe(spritesmith(config.options))
            , imgStream = spriteData.img.pipe(gulp.dest(config.dest.image))
            ,cssStream = spriteData.css.pipe(gulp.dest(config.dest.css));
        return mergeStream(imgStream, cssStream);
    });
    return "sprites";
}
function svgSprite(){
    //精灵图
    gulp.task('svgSprite', function () {
        return gulp.src("src/images/banklogo/*.svg")
            .pipe($.svgSprite({
                shape: {
                    spacing: {
                        padding: 5
                    }
                },
                mode: {
                    css: {
                        dest: "./",
                        layout: "diagonal",
                        sprite: "a.svg",
                        bust: false,
                        render: {
                            scss: {
                                dest: "css/sprite.scss",
                                template: "src/sprite-template.txt"
                            }
                        }
                    }
                },
                variables: {
                    mapname: "icons"
                }
            }))
            .pipe(gulp.dest("dest"))
            .on("end", function(){
                console.log("end");
                gulp.src("dest/css/sprite.scss").pipe(require("gulp-sass")({outputStyle: 'expanded'})).pipe(gulp.dest("dest/css"));
            })
    });
    gulp.task('sprite', ['pngSprite']);

    return "svgSprite";
}
function svg2png(from, to){
    //把svg转成png
    gulp.task('svg2png', function() {
        return gulp.src(from)
            .pipe($.svg2png())
            .pipe($.size({
                showFiles: true
            }))
            .pipe(gulp.dest(to));
    });
    return "svg2png";
}
function copy(from, to){
    gulp.task('copy', function () {
        /**src指定路径，从第一个包含通配符的那部分开始，路径结构会被复制到dest指定的目录中
         * */
        return gulp.src(from || "src/**/*.{js,html}")
            .pipe(gulp.dest(to || 'copy'))
    });
    return "copy";
}
function uglifyjs(from, to){
    gulp.task('uglify', function () {
        return gulp.src(from || ["../恒慧融/web/Public/js/a.js"])
            .pipe($.uglifyjs(
                {
                    mangle: false,
                    compress: {
                        drop_console: true//清除console.log语句
                    },
                    output: {beautify: true}}))
            .pipe(gulp.dest(to || 'dest/'))
    });
    return "uglifyjs";
}
function sort(){
    var sort = require('gulp-sort');

    // default sort
    gulp.src('./src/js/**/*.js')
        .pipe(sort())
        .pipe(gulp.dest('./build/js'));

    // pass in a custom comparator function
    gulp.src('./src/js/**/*.js')
        .pipe(sort(function(file1, file2){//实现compare方法，返回1、0、-1
            if (file1.path.indexOf('build') > -1) {
                return 1;
            }
            if (file2.path.indexOf('build') > -1) {
                return -1;
            }
            return 0;
        }))
        .pipe(gulp.dest('./build/js'));

    // sort descending
    gulp.src('./src/js/**/*.js')
        .pipe(sort({
            asc: false
        }))
        .pipe(gulp.dest('./build/js'));

    // sort with a custom comparator
    gulp.src('./src/js/**/*.js')
        .pipe(sort({
            comparator: function(file1, file2) {
                if (file1.path.indexOf('build') > -1) {
                    return 1;
                }
                if (file2.path.indexOf('build') > -1) {
                    return -1;
                }
                return 0;
            }
        }))
        .pipe(gulp.dest('./build/js'));

    // sort with a custom sort function
    var stable = require('stable');
    gulp.src('./src/js/**/*.js')
        .pipe(sort({
            customSortFn: function(files, comparator) {
                return stable(files, comparator);
            }
        }))
        .pipe(gulp.dest('./build/js'));
    return "sort";
}