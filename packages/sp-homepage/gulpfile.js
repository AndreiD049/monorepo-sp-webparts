'use strict';

const build = require('@microsoft/sp-build-web');
const path = require('path');
const bundleAnalyzer = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    const lastDirName = path.basename(__dirname);
    const dropPath = path.join(__dirname, 'temp', 'stats');
    generatedConfiguration.plugins.push(new bundleAnalyzer.BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static',
      reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
      generateStatsFile: true,
      statsFilename: path.join(dropPath, `${lastDirName}.stats.json`),
      logLevel: 'error'
    }));

    generatedConfiguration.plugins.push(
        new DuplicatePackageCheckerPlugin({
            verbose: true,
            emitError: true,
            exclude: (instance) => {
                // Sometimes different dependencies use the same package with different versions, if there is no possibility to avoid it, we can skip
				if (instance.name.startsWith('@fluentui')) return true;
				if (instance.name === '@microsoft/load-themed-styles') return true;
                return false;
            },
        })
    );

    // generatedConfiguration.resolve.alias = {
    //     ...generatedConfiguration.resolve.alias,
    //     'office-ui-fabric-react': path.resolve(__dirname, 'node_modules/office-ui-fabric-react/'),
    //     '@microsoft/load-themed-styles': path.resolve(__dirname, 'node_modules/@microsoft/load-themed-styles/'),
    // }

    return generatedConfiguration;
  }
});

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
build.addSuppression(/\[sass\]/g);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require('gulp'));

