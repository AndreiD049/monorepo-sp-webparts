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
import { Icon, Text, Dropdown, IconButton } from 'office-ui-fabric-react';
import styles from './Task.module.scss';
import colors from './Colors.module.scss';
import * as React from 'react';
import { TaskBody } from './TaskBody';
import { TaskPersona } from './DefaultPersona/TaskPersona';
var CLOSED_ICON = 'ChevronDown';
var OPEN_ICON = 'ChevronUp';
var DROPDOWN_STYLES = {
    caretDownWrapper: {
        display: 'none',
    },
    title: {
        border: 'none',
        height: '1.5em',
        lineHeight: '1.5em',
        minWidth: '100px',
    },
    dropdownItemSelected: {
        minHeight: '1.7em',
        lineHeight: '1.7em',
    },
    dropdownItem: {
        minHeight: '1.7em',
        lineHeight: '1.7em',
    },
    dropdown: {
        fontSize: '.8em',
    },
    dropdownOptionText: {
        fontSize: '.8em',
    },
};
var DROPDOWN_KEYS = [
    {
        key: 'Open',
        text: 'Open',
    },
    {
        key: 'Pending',
        text: 'In progress',
    },
    {
        key: 'Finished',
        text: 'Finished',
    },
    {
        key: 'Cancelled',
        text: 'Cancelled',
    },
];
export var Task = function (_a) {
    var info = _a.info, expired = _a.expired, isHovering = _a.isHovering, currentUserId = _a.currentUserId, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.style, style = _c === void 0 ? {} : _c, props = __rest(_a, ["info", "expired", "isHovering", "currentUserId", "className", "style"]);
    var _d = React.useState(false), open = _d[0], setOpen = _d[1];
    var toggleOpen = React.useCallback(function () {
        setOpen(function (prev) { return !prev; });
    }, []);
    var body = React.useMemo(function () {
        if (!open)
            return null;
        return React.createElement(TaskBody, { remark: info.remark, description: info.description });
    }, [open]);
    return (React.createElement("div", { className: "".concat(styles.task, " ").concat(colors[info.status.toLowerCase()], " ").concat(className), style: __assign({ borderLeftColor: props.theme ? props.theme.palette.themePrimary : 'inherit' }, style) },
        React.createElement("div", { className: styles.header },
            info.remark && (React.createElement(Icon, { className: styles['Task__remark-icon'], iconName: "InfoSolid", title: "Has remark" })),
            React.createElement(Text, { className: "".concat(expired && styles.expired, " ").concat(styles['Task__title']), variant: "mediumPlus" }, info.title),
            props.TaskPersona ? (props.TaskPersona) : (React.createElement(TaskPersona, { title: info.user.Title, email: info.user.EMail, className: styles.Task_person }))),
        React.createElement("div", { className: styles.subheader },
            React.createElement(Text, { variant: "medium" }, info.date),
            React.createElement(Text, { variant: "medium", className: styles.hours },
                ' ',
                info.time,
                ' ')),
        React.createElement("div", { className: styles.status },
            React.createElement(Text, { variant: "medium" }, "Status:"),
            React.createElement(Dropdown, { options: DROPDOWN_KEYS, styles: DROPDOWN_STYLES, selectedKey: info.status, onChange: info.user.ID === currentUserId || props.canEditOthers
                    ? props.onChange
                    : function () { return null; }, disabled: info.user.ID === currentUserId ? false : !props.canEditOthers })),
        info.description || info.remark ? (React.createElement("div", { className: styles.body },
            React.createElement(IconButton, { onClick: toggleOpen, iconProps: {
                    iconName: open ? OPEN_ICON : CLOSED_ICON,
                } }),
            body)) : null));
};
//# sourceMappingURL=index.js.map