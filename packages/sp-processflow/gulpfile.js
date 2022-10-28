'use strict';

const build = require('@microsoft/sp-build-web');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const path = require('path');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
build.addSuppression(/\[sass\]/g);

build.configureWebpack.mergeConfig({
    additionalConfiguration: (generatedConfiguration) => {
        generatedConfiguration.plugins.push(
            new DuplicatePackageCheckerPlugin({
                emitError: true,
                exclude: (instance) => {
                    // Sometimes different dependencies use the same package with different versions, if there is no possibility to avoid it, we can skip
                    if (instance.name === '@microsoft/load-themed-styles')
                        return true;
                    return false;
                },
            })
        );
        generatedConfiguration.resolve.alias = {
            ...generatedConfiguration.resolve.alias,
            'office-ui-fabric-react': path.resolve(
                // eslint-disable-next-line no-undef
                __dirname,
                'node_modules/office-ui-fabric-react/'
            ),
            '@microsoft/load-themed-styles': path.resolve(
                // eslint-disable-next-line no-undef
                __dirname,
                'node_modules/@microsoft/load-themed-styles/'
            ),
            'tslib': path.resolve(
                // eslint-disable-next-line no-undef
                __dirname,
                'node_modules/tslib/'
            ),
        };
        return generatedConfiguration;
    },
});

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

