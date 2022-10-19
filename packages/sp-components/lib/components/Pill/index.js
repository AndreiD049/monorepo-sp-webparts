var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
import styles from './Pill.module.scss';
export var Pill = function (_a) {
    var value = _a.value, id = _a.id, disabled = _a.disabled, rest = __rest(_a, ["value", "id", "disabled"]);
    var classNames = React.useMemo(function () {
        var result = "".concat(styles.pillContainerInner, " ").concat(rest.className);
        if (disabled) {
            result += " ".concat(styles.disabled);
        }
        return result;
    }, [disabled]);
    return (React.createElement("div", { className: styles.pillContainer },
        React.createElement("button", __assign({ id: id }, rest, { disabled: disabled, className: classNames, style: __assign({}, rest.style) }), value)));
};
//# sourceMappingURL=index.js.map