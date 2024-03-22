/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const path = require('path');
const bundleAnalyzer = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

build.configureWebpack.mergeConfig({
    additionalConfiguration: (generatedConfiguration) => {
        const lastDirName = path.basename(__dirname);
        const dropPath = path.join(__dirname, 'temp', 'stats');
        generatedConfiguration.plugins.push(
            new bundleAnalyzer.BundleAnalyzerPlugin({
                openAnalyzer: false,
                analyzerMode: 'static',
                reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
                generateStatsFile: true,
                statsFilename: path.join(dropPath, `${lastDirName}.stats.json`),
                logLevel: 'error',
            })
        );

        generatedConfiguration.plugins.push(
            new DuplicatePackageCheckerPlugin({
                verbose: true,
                emitError: true,
				strict: false,
                exclude: (instance) => {
                    // Sometimes different dependencies use the same package with different versions, if there is no possibility to avoid it, we can skip
                    if (instance.name === '@microsoft/load-themed-styles') return true;
                    if (instance.name === 'react-is') return true;
					if (instance.name.includes('@fluentui')) {
						console.log(instance.version);
					}
                    return false;
                },
            })
        );

        /** Do not bundle office-ui twice */
        generatedConfiguration.resolve.alias = {
            ...generatedConfiguration.resolve.alias,
            '@fluentui/react': path.resolve(
                __dirname,
                'node_modules/@fluentui/react/'
            ),
            '@microsoft/load-themed-styles': path.resolve(
                __dirname,
                'node_modules/@microsoft/load-themed-styles/'
            ),
            'tslib': path.resolve(
                __dirname,
                'node_modules/tslib'
            ),
        };

        return generatedConfiguration;
    },
});

build.addSuppression(
    `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);
build.addSuppression(/\[sass\]/g);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
    var result = getTasks.call(build.rig);

    result.set('serve', result.get('serve-deprecated'));

    return result;
};

/* fast-serve */
const { addFastServe } = require('spfx-fast-serve-helpers');
addFastServe(build);
/* end of fast-serve */

// disable tslint
build.tslintCmd.enabled = false;

build.initialize(gulp);
