"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSites = useSites;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useSites() {
    var _a = React.useState([]), sites = _a[0], setSites = _a[1];
    var sitesTags = React.useMemo(function () {
        return sites.map(function (site) { return ({
            name: site,
            key: site,
            data: site,
        }); });
    }, [sites]);
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = setSites;
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getAllSites()];
                        case 1:
                            _a.apply(void 0, [_b.sent()]);
                            return [2 /*return*/];
                    }
                });
            });
        }
        run().catch(function (err) { return console.error(err); });
    }, []);
    return {
        options: sites,
        set: setSites,
        tags: sitesTags,
    };
}
//# sourceMappingURL=useSites.js.map