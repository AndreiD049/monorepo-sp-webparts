"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApprovers = useApprovers;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useApprovers(site) {
    var _a = React.useState([]), approvers = _a[0], setApprovers = _a[1];
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(!site && approvers.length === 0)) return [3 /*break*/, 1];
                            setApprovers([]);
                            return [3 /*break*/, 3];
                        case 1:
                            if (!site) return [3 /*break*/, 3];
                            _a = setApprovers;
                            return [4 /*yield*/, lookup_service_1.LookupService.getApproversByLocation(site)];
                        case 2:
                            _a.apply(void 0, [_b.sent()]);
                            _b.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        run().catch(function (err) { return console.error(err); });
    }, [site]);
    return {
        options: approvers,
        set: setApprovers,
        tags: [],
    };
}
//# sourceMappingURL=useApprovers.js.map