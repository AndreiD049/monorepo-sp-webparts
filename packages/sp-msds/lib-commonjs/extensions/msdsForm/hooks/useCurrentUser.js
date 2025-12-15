"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCurrentUser = useCurrentUser;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var lookup_service_1 = require("../services/lookup-service");
function useCurrentUser() {
    var _a = React.useState({}), user = _a[0], setUser = _a[1];
    React.useEffect(function () {
        function run() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = setUser;
                            return [4 /*yield*/, lookup_service_1.LookupServiceCached.getCurrentUser()];
                        case 1:
                            _a.apply(void 0, [_b.sent()]);
                            return [2 /*return*/];
                    }
                });
            });
        }
        run().catch(function (err) { return console.error(err); });
    }, []);
    return user;
}
//# sourceMappingURL=useCurrentUser.js.map