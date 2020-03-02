const path = require('path');
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let template = path.join(__dirname, `../src/index.html`);
const isProd = process.env.NODE_ENV === 'production'

let plugin = []
let devServer = {}
if (!isProd) {
    devServer = {
        // 告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要
        contentBase: '../dist/',
        historyApiFallback: true,
        inline: true,
        // 终端不显示打包信息 console
        clientLogLevel: "none",
        hot: true,
        host: '0.0.0.0',
        port: 9000,
        before(_, server) {
            server._watch(path.join(__dirname, '../src/index.html'))
        },
    }
    plugin = [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            // 输出文件路径和名称
            filename: path.join(__dirname, `../dist/index.html`),
            // html模板所在的文件路径
            template,
            // script标签位于html文件的 body 底部
            inject: true,
            hot: true,
            // chunks主要用于多入口文件，当你有多个入口文件，那就回编译后生成多个打包后的文件，那么chunks 就能选择你要使用那些js文件
            // chunk加载顺序
            chunksSortMode: 'dependency',
        })
    ]
} else {
    plugin = [
        new UglifyJsPlugin({
            sourceMap: true,
            parallel: true,
        }),
        // extractCSS,
        // extractLESS,
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[hash:7].css'
        }),
        // 压缩css，解决ExtractTextPlugin重复打包的问题
        new OptimizeCssAssetsPlugin(),
    ]
}


module.exports = {
    mode: 'development',
    devtool: '#cheap-module-eval-source-map',
    entry: {
        dragRotateScale: path.resolve(__dirname, '../src/dragRotateScale.js'),
        test: path.resolve(__dirname, '../src/test.js'),
    },
    output: {
        // 将js文件放的位置
        path: path.resolve(__dirname, '../dist/'),
        // 生成的名称
        filename: '[name].js', // 输出文件
        libraryTarget: 'umd', // 采用通用模块定义
        library: 'dragRotateScale', // 库名称
        libraryExport: 'default', // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
        globalObject: 'this' // 兼容node和浏览器运行，避免window is not undefined情况
    },
    module: {
        rules: [{
                test: /\.(le|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ],
                include: path.join(__dirname, '../src/'),
            }, {
                test: /\.js?$/,
                include: [path.join(__dirname, '../src')],
                exclude: path.join(__dirname, '../node_modules/'),
                loader: "babel-loader",
                options: {
                    plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-transform-async-to-generator"],
                    presets: ["@babel/preset-env"]
                },
            },
            // html中的img标签
            {
                test: /\.(html)$/i,
                loader: 'html-withimg-loader?min=false',
                include: [path.join(__dirname, '../src')],

                // 不能加下面这个options ， html-webpack-plugin会报错
                // options: {
                //     esModule: false,
                //     deep:true,
                // 	limit: 10000,
                // 	name: 'static/img/[name].[hash:7].[ext]'
                // }
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                include: path.join(__dirname, '../src/'),
                options: {
                    //将这一配置项设置成false即可，如果不设置这一项，html中的img路径是这样的{"default":"/static/img/b.024578a.jpg"}
                    esModule: false,
                    limit: 10000,
                    name: 'static/img/[name].[hash:7].[ext]'
                        //outputPath: 'img/',
                        //publicPath: '../'
                }
            },
            // 视频
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                include: path.join(__dirname, '../src/'),
                options: {
                    esModule: false,
                    limit: 10000,
                    name: 'static/media/[name].[hash:7].[ext]'
                }
            },
            // 字体
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    esModule: false,
                    limit: 10000,
                    name: 'static/fonts/[name].[hash:7].[ext]'
                }
            },
        ]
    },
    resolve: {
        // 使用的扩展名
        extensions: [".js", ".json", ".jsx", ".css", ".less"],
    },
    plugins: [
        //设置每一次build之前先删除dist  
        new CleanWebpackPlugin({
            // 默认false  dry为true时，模拟删除，假删除，不会真的删掉文件
            dry: false,
            verbose: false,
            // 删除指定文件/文件夹   
            cleanOnceBeforeBuildPatterns: ['../dist'],
            // 删除工作区外的文件夹是危险操作，要配置这项
            dangerouslyAllowCleanPatternsOutsideProject: true,
        }),
        ...plugin
    ],
    devServer
}
