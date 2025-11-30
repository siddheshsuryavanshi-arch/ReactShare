'use strict';

var path = require('path');
var webpack = require('sgmf-scripts').webpack;
var RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

var jsFiles = require('sgmf-scripts').createJsPath();
var scssFiles = require('sgmf-scripts').createScssPath();

var bootstrapPackages = {
    Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
    Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
    Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
    Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
    Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
    Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
    Util: 'exports-loader?Util!bootstrap/js/src/util'
};

module.exports = [
    // ----------------------------------------------------
    // JS files bundling (SFRA default)
    // ----------------------------------------------------
    {
        mode: 'production',
        name: 'js',
        entry: jsFiles,
        output: {
            path: path.resolve(
                './cartridges/app_storefront_base/cartridge/static'
            ),
            filename: '[name].js'
        },
        module: {
            rules: [
                {
                    test: /bootstrap(.)*\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env'],
                            plugins: ['@babel/plugin-proposal-object-rest-spread'],
                            cacheDirectory: true
                        }
                    }
                }
            ]
        },
        plugins: [new webpack.ProvidePlugin(bootstrapPackages)]
    },

    // ----------------------------------------------------
    // SCSS compilation (SFRA default)
    // ----------------------------------------------------
    {
        mode: 'none',
        name: 'scss',
        entry: scssFiles,
        output: {
            path: path.resolve(
                './cartridges/app_storefront_base/cartridge/static'
            )
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                esModule: false
                            }
                        },
                        {
                            loader: 'css-loader',
                            options: { url: false }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [require('autoprefixer')()]
                                }
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: require('sass'),
                                sassOptions: {
                                    includePaths: [
                                        path.resolve('node_modules'),
                                        path.resolve('node_modules/flag-icon-css/sass')
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new RemoveEmptyScriptsPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[name].css'
            })
        ],
        optimization: {
            minimizer: ['...', new CssMinimizerPlugin()]
        }
    },

    // ---------------------------------------------------------
    // 🚀 CUSTOM REACT + TYPESCRIPT BUNDLE (PDP)
    // ---------------------------------------------------------
    {
        mode: 'production',
        name: 'react',
        entry: {
            reactPDP: './cartridges/app_custom/cartridge/client/default/react/pdp/index.tsx'
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(
                './cartridges/app_custom/cartridge/static/default/js'
            )
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.jsx']
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: 'ts-loader'
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react'
                            ]
                        }
                    }
                }
            ]
        }
    }
];



