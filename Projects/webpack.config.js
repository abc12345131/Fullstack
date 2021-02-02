//webpack use commonjs as 
//use resolve to join the path
const { resolve } = require('path');
//install html-webpack-plugin to auto import js/css to html
const HtmlWebpackPlugin = require('html-webpack-plugin');
//install mini-css-extract-plugin to extract css in separate file
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//install optimize-css-assets-webpack-plugin to compress css file
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

//set package.json browserlist to development mode, default is production
process.env.NODE_ENV = 'development';

//reuse css compatibility loader
const commonCssLoader = [
    //use style-loader in development for HMR(hot module replacement)
    //'style-loader',
    //use mini-css-extract-plugin loader replace style-loader in production for user experience
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
        //install postcss-loader postcss-preset-env
        loader: 'postcss-loader',
        options: {
            ident: 'postcss',
            plugins: () => [
                /*
                    set package.json 
                    "browserlist": {
                        "development": [
                            "last 1 chrome version",
                            "last 1 firefox version",
                            "last 1 safari version"],
                        "production": [
                            ">0.2%",
                            "not dead",
                            "not op_mini all"]
                    }
                */    
                //help plugin find setting of browserlist in package.json
                require('postcss-preset-env')()
            ]
        }
    }
]

module.exports = {
    entry: ['./src/js/index.js', './src/index.html'],
    output: {
        filename: 'js/build.js',
        path: resolve(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [...commonCssLoader]
            },
            {
                test: /\.less$/,
                use: [...commonCssLoader, 'less-loader']
            },
            {
                test: /\.js$/,
                //do not check imported node_modules 
                exclude: /node_modules/,
                /*
                    set package.json 
                    "eslintConfig": {
                        "extends": "airbnb-base"
                    }
                */
                //make sure js code go through eslint-loader first, then babel-loader
                enforce: 'pre',
                //install eslint-config-airbnb-base eslint-plugin-import eslint
                loader: 'eslint-loader',
                options: {
                    //auto fix the code
                    fix: true        
                }
            },
            {
                test: /\.js$/,
                //do not check imported node_modules 
                exclude: /node_modules/,
                //install babel-loader @babel/core @babel/preset-env
                loader: 'babel-loader',
                options: {
                    //1.set compatibility options (only use @babel/preset-env only for basic compatibility)
                    //2.for full compatibility install and import @babel/polyfill in js code, but the file will be huge
                    //3.load on demand, install core-js
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                //load on demand
                                useBuiltIns: 'usage',
                                //core-js version
                                corejs: {
                                    version: 3
                                },
                                //target compatibility version
                                targets: {
                                    chrome: '60',
                                    firefox: '60',
                                    ie: '9',
                                    safari: '10',
                                    edge: '17'
                                }
                            }
                        ]
                    ]        
                }
            },            
            {
                test: /\.(jpg|png|gif)$/,
                //install url-loader
                loader: 'url-loader',
                options: {
                    limit: 8 * 1024,
                    //html-loader use commonjs, change default es6 to false
                    esModule: false, 
                    name: '[hash:10].[ext]',
                    outputPath: 'imgs'
                }
            },
            {
                test: /\.html$/,
                //install html-loader for html pics
                loader: 'html-loader'
            },
            {
                exclude: /\.(js|css|less|jpg|png|gif|html)$/,
                //install file-loader for media
                loader: 'file-loader',
                options: {
                    name: '[hash:10].[ext]',
                    outputPath: 'media'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin(
            {
                //auto import all packed js/css based on template
                template:'./src/index.html',
                //compress html code
                minify: {
                    collapseWhitespace: true,
                    removeComments: true
                }
            }
        ),
        new MiniCssExtractPlugin(
            {
                filename: 'css/build.css'
            }
        ),
        new OptimizeCssAssetsWebpackPlugin()
    ],
    //compress js code use production mode
    mode: 'development',

    devServer: {
        contentBase: resolve(__dirname, 'build'),
        compress: true,
        port: 3000,
        open: true,
        hot: ture
    },
    devtool: 'source-map'
};
