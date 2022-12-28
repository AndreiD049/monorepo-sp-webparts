'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const build = require('@microsoft/sp-build-web');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

build.addSuppression(
    `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);

build.addSuppression(/\[sass\]/g);

build.configureWebpack.mergeConfig({
    additionalConfiguration: (generatedConfiguration) => {
        generatedConfiguration.plugins.push(
            new DuplicatePackageCheckerPlugin({
                emitError: true,
                exclude: (instance) => {
                    // Sometimes different dependencies use the same package with different versions, if there is no possibility to avoid it, we can skip
                    const ignoredDuplicates = new Set(['@microsoft/load-themed-styles', '@fluentui/dom-utilities', '@fluentui/theme'])
                    if (ignoredDuplicates.has(instance.name))
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

build.tslintCmd.enabled = false;

/* fast-serve */
const { addFastServe } = require('spfx-fast-serve-helpers');
addFastServe(build);
/* end of fast-serve */

build.initialize(require('gulp'));
