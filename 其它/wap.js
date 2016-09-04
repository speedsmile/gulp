var gulp = require("gulp"), uglify = require("gulp-uglify"), uglifyjs = require("gulp-uglifyjs"), concat = require("gulp-concat")
    , basePath = {
        base: "./../",
        get html(){return `${this.base}Views/`;},
        get css(){return `${this.base}js/`;},
        get images(){return `${this.base}js/`;},
        get js(){return `${this.base}js/`;},
        get lib(){return `${this.base}lib/`;},
        get commonLib(){
            var src = ["jquery-2.2.4.min.js", "fastclick.js", "layer/layer.js", "jquery.cookie.js", "jquery.base64.js", "cryp_min.js"];
            return `${this.lib}{${src.join(",")}}`;
        },
        get excludeLib(){
            return `!{${this.commonLib.join(",")}}`;
        }
    }
    , destPath = {
        base: "./../../../Finance_wap_dest/",
        get pub(){return `${this.base}web/Public/`},
        get html(){return `${this.base}Views/`},
        get js(){return `${this.pub}js/`},
        get lib(){return `${this.pub}lib/`}
    };
module.exports = function(){
    gulp.task("default", [lib(), jsMin(), other()]);
    gulp.run("default");
};
module.exports();
/**全局引用的公共插件*/
function lib(){
    gulp.task("lib", function(){
        return gulp.src([basePath.commonLib].concat(`${basePath.js}{common.js,common_wap.js}`)).pipe(uglifyjs("lib.js",
            {
                mangle: false,
                compress: {
                    drop_console: true//清除console.log语句
                },
                output: {beautify: false}}))
            .pipe(gulp.dest(destPath.lib));
    });
    return "lib";
}
/**公共css*/
function commonCss(){
    gulp.task("commonCss", function(){
        //css合并处理

    });
}
function jsMin(){
    gulp.task("jsmin", function(){
        gulp.src([`${basePath.js}**/*.js`, `!${basePath.js}{common.js,common_wap.js}`]).pipe(uglify()).pipe(gulp.dest(destPath.js));
    });
    return "jsmin";
}
function other(){
    gulp.task("other", function(){
        //把lib中的其它插件发布到部署项目中
        gulp.src([`${basePath.lib}**/*`, `!${basePath.commonLib}`]).pipe(gulp.dest(destPath.lib));
        //css、images，原样拷贝过去
        //只能排除文件，没有排除文件夹的机制
        gulp.src([`${basePath.base}{images,css}/**/*`]).pipe(gulp.dest(destPath.pub));
        gulp.src([`${basePath.base}Views/**/*`]).pipe(gulp.dest(destPath.html));
    });
    return "other";
}