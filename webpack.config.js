const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "main.js"), // path to the main .ts file
    output: {
        filename: "bundle.js", // name for the js file that is created/compiled in memory
        clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
        host: "0.0.0.0",
        port: 8080, // port that we're using for local host (localhost:8080)
        static: path.resolve(appDirectory, "./"), // tells webpack to serve from the public folder
        hot: true,
        devMiddleware: {
            publicPath: "/",
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|glb|gltf)$/i,
                loader: 'file-loader',
                options: {
                    publicPath: './',
                    name: '[name].[ext]'
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: [
                        '@babel/preset-env'
                    ],
                    "plugins": ['@babel/plugin-proposal-class-properties'], //<--Notice here
                }
            },  
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "index.html"),
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(appDirectory, "textures"), to: "textures" },
                { from: path.resolve(appDirectory, "Assets"), to: "Assets" },
                { from: path.resolve(appDirectory, "Modules"), to: "Modules" },
                { from: path.resolve(appDirectory, "zombie_icon.ico"), to: "zombie_icon.ico" },
            ],
        }),
    ],
    mode: "development",
    devtool: "source-map"
};
