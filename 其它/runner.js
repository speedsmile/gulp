//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'), path = require("path"); //本地安装gulp所用到的地方

function TaskChain(task){
    task && this.add(task);
}
TaskChain.prototype = {
    add: function(task){//添加任务，序列化成链式调用结构
        this._task ? (this._task = this._task.next = task) : (this._headTask = this._task = task);
    },
    pipeChain: function(){
        this._task = this._headTask;
        return (function(task){
            var next = task.next;
            return next ? task().pipe(arguments.callee(next)) : task();
        }(this._task));
    }
};
var methods = {
    uglify: function(config, from_parent, to_parent){
        var task = {}, i, len;
        for(i = 0, len = config.length; i < len; i++){
            var from = path.join(from_parent || "", config[i].from), to = path.join(to_parent || "", config[i].to);
            //把dest相同的任务合并成一个任务，减少任务的调用次数
            task[to] ? task[to].push(from) : task[to] = [from];
        }
        return function(){
            var uglify = require("gulp-uglify"), chain;
            for(var i in task){
                chain = chain ? chain.pipe(gulp.src(task[i])) : gulp.src(task[i]);
                chain.pipe(uglify({mangle: false,compress: true,beautify: true})).pipe(gulp.dest(i));
            }
            return chain;
        };
    }
};
module.exports = function(){
    task();
    var uglify = require("gulp-uglify");
    gulp.task('default',['dist']); //定义默认任务
    gulp.run("default");//通过代码手动启动gulp任务
};
module.exports();//命令行使用gulp的时候使用，如果当做模块使用则注释这句

/**************** 解析配置动态生成部署任务 ****************/

function task(config){
    config = config || {
            from: path.join("..", "恒慧融"),
            to: "E:/workspace1/Finance/code/Finance_wap/finance",//项目根路径
            uglify: [
                {
                    from: "web/Public/js/**/*.js",
                    to: "web/Public/js",//lib目录的相对位置
                    options: {}
                }
            ]
        };
    var from = config.from, to = config.to, taskChain = new TaskChain(), m, method, len;
    delete config.from;
    delete config.to;
    for(m in config){
        //如果配置的任务有对应的处理方法（methods中的方法），则执行，否则跳过
        if(m in methods){
            method = methods[m](config[m], from, to);
            taskChain.add(method);//根据配置动态拼接出任务代码，把执行方法存入队列中
        }
    }
    gulp.task("dist", function(){
        return taskChain.pipeChain().on("end", function(){
            console.log("end");
        });
        return (function(task){
            var callee = arguments.callee, next = task.next;
            return task().on("end", function(){
                if(next) {
                    callee(next);
                }else{
                    console.log("finish");
                }
            });
        }(taskChain));
    });
}

function copy(){
    gulp.task('copy', function () {
        /**src指定路径，从第一个包含通配符的那部分开始，路径结构会被复制到dest指定的目录中
         * */
        return gulp.src("E:/workspace/Finance/code/Finance_v1.3.0/finance/{src/**/*.js,Views/**/*.html}")
            .pipe(gulp.dest('d:/a'))
    });
}
function uglify(){
    gulp.task('uglify', function () {
        return gulp.src("src/**/*.js").pipe(uglify({mangle: false, compress: false, beautify: false}))
            .pipe(gulp.dest('dest/js'));
    });
}
function less(){
    //定义一个testLess任务（自定义任务名称）
    gulp.task('testLess', function () {
        return gulp
            .src('src/less/index.less') //该任务针对的文件
            .pipe(require('gulp-less')()) //该任务调用的模块
            .pipe(gulp.dest('dest/css')); //将会在src/css下生成index.css
    });
}
function sass(){
    gulp.task('sass', function () {
        return gulp.src(["src/scss/**/*.scss","!src/scss/**/_*.scss"]).pipe(require("gulp-sass")())
            .pipe(gulp.dest('dest/css'))
    });
}
function sprites(){
    //精灵图
    gulp.task('sprites', function() {
        var spritesmith = require('gulp.spritesmith'), srcAssets = "src"
        , config = {
            src: srcAssets + '/images/*',
            dest: {
                css: 'dest/css/',
                image: 'dest/images/'
            },
            options: {
                cssName: 'sprites.scss',
                cssFormat: 'css',
                cssOpts: {
                    cssClass: function (item) {
                        // If this is a hover sprite, name it as a hover one (e.g. 'home-hover' -> 'home:hover')
                        console.log("item.name" + item.name + ", " + item.name.indexOf('-hover') !== -1);
                        if (item.name.indexOf('-hover') !== -1) {
                            return '.icon-' + item.name.replace('-hover', ':hover');
                            // Otherwise, use the name as the selector (e.g. 'home' -> 'home')
                        } else {
                            return '.icon-' + item.name;
                        }
                    }
                },
                imgName: 'icon-sprite.png',
                imgPath: '../images/icon-sprite.png'//合成的精灵图被最终发布的css引用的路径
            }
        }
        , spriteData = gulp.src(config.src).pipe(spritesmith(config.options));
        spriteData.img.pipe(gulp.dest(config.dest.image));
        spriteData.css.pipe(gulp.dest(config.dest.css));
    });
}