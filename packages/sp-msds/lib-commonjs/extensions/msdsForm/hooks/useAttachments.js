"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RELOAD_ATT_EVT = void 0;
exports.reloadAttachments = reloadAttachments;
exports.useAttachments = useAttachments;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var item_service_1 = require("../services/item-service");
exports.RELOAD_ATT_EVT = 'sp-msds/reloadAttachmentsEvent';
function reloadAttachments() {
    document.dispatchEvent(new CustomEvent(exports.RELOAD_ATT_EVT));
}
function useAttachments(itemId) {
    var _a = React.useState(false), reload = _a[0], setReload = _a[1];
    var _b = React.useState([]), attachments = _b[0], setAttachments = _b[1];
    React.useEffect(function () {
        if (itemId && itemId > 0) {
            item_service_1.ItemService.getAttachments(itemId)
                .then(function (att) { return setAttachments(att); })
                .catch(function (err) { return console.error(err); });
        }
    }, [itemId, reload]);
    React.useEffect(function () {
        function run() {
            setReload(function (prev) { return !prev; });
        }
        document.addEventListener(exports.RELOAD_ATT_EVT, run);
        return function () { return document.removeEventListener(exports.RELOAD_ATT_EVT, run); };
    }, []);
    return attachments;
}
//# sourceMappingURL=useAttachments.js.map