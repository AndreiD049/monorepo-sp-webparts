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
import { Icon, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Pill } from '../../Pill';
import { CheckExpandButton } from '../CheckExpandButton';
import { ParentStroke } from '../ParentStroke';
import styles from './TitleCell.module.scss';
export var TitleCell = function (_a) {
    var _b = _a.level, level = _b === void 0 ? 0 : _b, _c = _a.style, style = _c === void 0 ? {} : _c, props = __rest(_a, ["level", "style"]);
    return (React.createElement("div", { style: style, className: styles.container, "data-type": "row", itemType: "button", onDoubleClick: props.onDoubleClick || (function () { return null; }) },
        React.createElement("div", { style: {
                marginLeft: 30 * level,
                position: 'relative',
            } },
            React.createElement(CheckExpandButton, { finishedSubtasks: props.finishedSubtasks, totalSubtasks: props.totalSubtasks, onClick: props.onClick || (function () { return null; }), onToggleOpen: props.onToggleOpen || (function () { return null; }), taskId: props.taskId, open: props.open, taskFinished: props.taskFinished, disabled: props.buttonDisabled }),
            React.createElement(ParentStroke, { taskId: props.taskId, parentId: props.parentId, prevSiblingId: props.prevSiblingId })),
        props.orphan && React.createElement(Pill, { value: "Subtask" }),
        React.createElement("div", { className: styles.titleCell },
            React.createElement(Text, { variant: "medium", block: true, className: "".concat(styles.titleText, " ").concat(props.taskFinished ? styles.titleTextFinished : ''), title: props.title }, props.title),
            React.createElement("div", { className: styles.titleCountIcons },
                React.createElement("div", null,
                    React.createElement(Icon, { iconName: "Comment" }),
                    " ",
                    props.comments),
                React.createElement("div", null,
                    React.createElement(Icon, { iconName: "Attach" }),
                    " ",
                    props.attachments)))));
};
//# sourceMappingURL=index.js.map