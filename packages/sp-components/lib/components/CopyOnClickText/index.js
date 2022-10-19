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
import { Icon, MessageBarType, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import styles from './CopyOnClickText.module.scss';
// returns an object with a display value (that shoule be shown)
// And copy value, that should be copied
// In order to cover scenarios like [[Long text|display]]
var parseValue = function (text) {
    var result = {
        display: text,
        copy: text,
    };
    var pipeIdx = text.indexOf('|');
    if (pipeIdx > -1) {
        var isSinglePipe = text.lastIndexOf('|') === pipeIdx;
        if (isSinglePipe) {
            result.display = text.slice(pipeIdx + 1);
            result.copy = text.slice(0, pipeIdx);
        }
    }
    return result;
};
export var CopyOnClickText = function (props) {
    var values = React.useMemo(function () { return parseValue(props.text); }, [props.text]);
    var handleClick = React.useCallback(function () {
        var text = props.children;
        navigator.clipboard.writeText(values.copy);
        SPnotify({
            message: "Text '".concat(values.copy, "' copied to clipboard"),
            messageType: MessageBarType.success,
        });
    }, [values]);
    return (React.createElement("span", { className: styles.container, onClick: handleClick },
        React.createElement(Text, __assign({}, props), values.display),
        React.createElement(Icon, { className: styles.icon, iconName: "ClipboardList" })));
};
//# sourceMappingURL=index.js.map