//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'); //本地安装gulp所用到的地方
var postcss      = require('gulp-postcss')
    , autoprefixer = require('autoprefixer')({//自动浏览器前缀插件
    browsers: ["ie 7-11", "last 20 chrome versions"],
    cascade: true, //是否美化属性值 默认：true 像这样：
    remove: true //是否去掉不必要的前缀 默认：true
})
    , cssgrace = require("cssgrace");
module.exports = function(){
    gulp.task('default',[less()]); //定义默认任务
    //jshint();
    //gulp.task('default',['jshint']); //定义默认任务
	//gulp.watch(["src/**/*.png"],["default"]);
    gulp.run("default");//通过代码手动启动gulp任务
};
module.exports();//命令行使用gulp的时候使用，如果当做模块使用则注释这句
function copy(){
    gulp.task('copy', function () {
        /**src指定路径，从第一个包含通配符的那部分开始，路径结构会被复制到dest指定的目录中
         * */
        gulp.src("src/**/*.{js,html}")
            .pipe(gulp.dest('copy'))
    });
}
function jshint(){
    gulp.task('jshint', function () {
        var jshint   = require('gulp-jshint');//浏览器兼容插件，比如opacity，inline-block
        var map = require('map-stream');
        var myReporter = map(function (file, cb) {
            if (!file.jshint.success) {
                console.log('JSHINT fail in '+file.path);
                file.jshint.results = file.jshint.results.filter(function (re) {
                    var err = re.error;
                    /**"W033": Missing semicolon.  缺少分号
                     * "W041": Use '===' to compare with ''，"": Use '===' to compare with '0'，Use '===' to compare with 'null'；
                     * 'W018'： var re = !(fun.apply(this, args) === false);	Confusing use of '!'.
                     * */
                    if(err.code == "W033"){
                        err.reason = "缺少分号";
                        return true;
                    }
                    return false;
                });
            }
            cb(null, file);
        });
        gulp.src(['E:\\workspace\\Finance\\code\\Finance_wap\\web\\Public\\js\\**\\*.js'])
            .pipe(jshint(
                {
                    undef: false,  // 所有的非全局变量，在使用前必须都被声明
                    predef: [ "jQuery", "$", "token_id", "login_flag" ],//允许这些变量可以不声明就使用
                    boss: true,     //允许在if，for，while语句中使用赋值
                    debug: false,
                    laxbreak: true,  //允许不安全的行中断(与laxcomma配合使用)
                    laxcomma: true, //允许逗号开头的编码样式
                    eqnull: true,   //允许使用==来判断null
                    expr: true,     //允许应该出现赋值或函数调用的地方使用表达式  比如允许  o.error && o.error.apply(o, arguments);
                    lastsemic: true, //允许单行控制块省略分号。但是，如果块的最后一个语句和}之间有断行，则会被检测出要加分号
                    multistr: true,  //允许多行字符串
                    smarttabs: true //允许混合tab和space排版

                }))
            .pipe(myReporter)
            .pipe(jshint.reporter(require('gulp-jshint-html-reporter'), {filename:'jshint-report.html'}));
            //.pipe(jshint.reporter(require('jshint-stylish')));
    });

}
function jslint(){
    gulp.task('jslint', function () {
        var jslint   = require('gulp-jslint-simple');//浏览器兼容插件，比如opacity，inline-block
        gulp.src(['E:\\workspace\\Finance\\code\\Finance_wap\\web\\Public\\js\\common_wap.js','E:\\workspace\\Finance\\code\\Finance_wap\\web\\Public\\js\\common.js'])
            .pipe(jslint.run({
                // project-wide JSLint options
                "undef": false,
                "unused": false,
                vars: false
            }))
            .pipe(jslint.report({
                // example of using a JSHint reporter
                reporter: require('jshint-stylish').reporter
            }));
    });

}
function uglify(){
    gulp.task('uglify', function () {
        var uglify = require("gulp-uglifyjs");
        return gulp.src(["../恒慧融/web/Public/js/a.js"])
        .pipe(uglify(
            {
                mangle: false,
                compress: {
                    drop_console: true//清除console.log语句
                },
                output: {beautify: true}}))
        .pipe(gulp.dest('dest/'))
    });
}
function less(){
    //定义一个testLess任务（自定义任务名称）
    gulp.task('less', function () {
        var less = require('gulp-less');
        gulp
            .src('task/less/**/*.less') //该任务针对的文件
            .pipe(less()) //该任务调用的模块
            .pipe(gulp.dest('dest/css')); //将会在src/css下生成index.css

    });
    return "less";
}
function sass(){
    gulp.task('sass', function () {
        var sass = require("gulp-sass");
        gulp.src(["src/scss/**/*.scss","!src/scss/**/_*.scss"]).pipe(sass())
            .pipe(gulp.dest('dest/sass'))
    });
}
function prefixer(){
    gulp.task('prefixer', function () {
        var sourcemaps   = require('gulp-sourcemaps');//浏览器兼容插件，比如opacity，inline-block
        gulp.src('src/less/index.less').pipe(require('gulp-less')())
            .pipe(sourcemaps.init())
            .pipe(postcss([ autoprefixer, cssgrace ]))
            .pipe(sourcemaps.write('.')).
        pipe(gulp.dest('dest/css'));
    });
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
        var spriteData = gulp.src(config.src).pipe(spritesmith(config.options));

        spriteData.img
            .pipe(gulp.dest(config.dest.image));

        spriteData.css
            .pipe(gulp.dest(config.dest.css));
    });
}
function svgSprite(){
    //精灵图var gulp = require('gulp');
    var $ = {
        svgSprite: require('gulp-svg-sprite')
        //,svg2png: require('gulp-svg2png'),
        //size: require('gulp-size')
    };
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

    //gulp.task('pngSprite', ['svgSprite'], function() {
    //    return gulp.src(basePaths.dest + paths.sprite.svg)
    //        .pipe($.svg2png())
    //        .pipe($.size({
    //            showFiles: true
    //        }))
    //        .pipe(gulp.dest(paths.images.dest));
    //});

    //gulp.task('sprite', ['pngSprite']);
}