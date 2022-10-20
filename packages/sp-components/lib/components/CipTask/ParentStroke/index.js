import * as React from 'react';
import styles from './ParentStroke.module.scss';
var getConnectingStroke = function (from, to, prev) {
    var hasPrev = prev !== from;
    var fromRect = from.getBoundingClientRect();
    var toRect = to.getBoundingClientRect();
    var prevRect = hasPrev ? prev.getBoundingClientRect() : fromRect;
    var yDiff = Math.abs(prevRect.bottom - toRect.top);
    if (hasPrev) {
        yDiff += from.clientHeight / 2 + 3;
    }
    var xDiff = Math.abs(fromRect.left + from.clientWidth / 2 - toRect.left);
    return (React.createElement("svg", { className: styles.parentStroke, style: {
            top: "-".concat(yDiff, "px"),
            left: "-".concat(xDiff, "px"),
            height: "".concat(yDiff + to.clientHeight / 2, "px"),
            width: "".concat(xDiff + 1, "px"),
        } },
        React.createElement("path", { d: "M0 0 l0 ".concat(yDiff + to.clientHeight / 2 - 3, " l3 3 l").concat(xDiff - 3, " 0") })));
};
export var ParentStroke = function (props) {
    var _a = React.useState(null), self = _a[0], setSelf = _a[1];
    React.useEffect(function () {
        setTimeout(function () {
            setSelf(document.getElementById("task-".concat(props.taskId)));
        }, 0);
    }, [props]);
    if (props.parentId) {
        var parent_1 = document.getElementById("task-".concat(props.parentId));
        var prev = props.prevSiblingId && document.getElementById("task-".concat(props.prevSiblingId))
            ? document.getElementById("task-".concat(props.prevSiblingId))
            : parent_1;
        if (parent_1 && self) {
            return getConnectingStroke(parent_1, self, prev);
        }
    }
    return null;
};
//# sourceMappingURL=index.js.map