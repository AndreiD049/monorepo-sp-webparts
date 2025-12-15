"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.encodeXML = encodeXML;
exports.decodeXML = decodeXML;
exports.getPermittedYearsPerSite = getPermittedYearsPerSite;
var lodash_1 = require("lodash");
function formatDate(date) {
    if (!date)
        return "";
    var month = "0".concat(date.getMonth() + 1).slice(-2);
    var day = "0".concat(date.getDate()).slice(-2);
    return "".concat(date.getFullYear(), "-").concat(month, "-").concat(day);
}
function encodeXML(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function decodeXML(text) {
    return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
function getPermittedYearsPerSite(site) {
    var permitYearsPerSite = {
        "JLT": 5,
    };
    if (permitYearsPerSite[site] && (0, lodash_1.isNumber)(permitYearsPerSite[site])) {
        return permitYearsPerSite[site];
    }
    return 3;
}
//# sourceMappingURL=utils.js.map