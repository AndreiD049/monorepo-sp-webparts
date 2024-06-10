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
					if (instance.name.includes('@fluentui') || instance.name.includes('@microsoft')) {
						return true
					}
                    return false;
                },
            })
        );
        generatedConfiguration.resolve.alias = {
            ...generatedConfiguration.resolve.alias,
            '@fluentui': path.resolve(
                // eslint-disable-next-line no-undef
                __dirname,
                'node_modules/@fluentui/'
            ),
            tslib: path.resolve(
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
