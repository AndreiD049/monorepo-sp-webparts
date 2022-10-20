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
import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './ActionsCell.module.scss';
export var ActionsCell = function (_a) {
    var _b = _a.style, style = _b === void 0 ? {} : _b, props = __rest(_a, ["style"]);
    var items = React.useMemo(function () {
        var result = [];
        props.items.forEach(function (item) {
            switch (item.name) {
                case 'add':
                    result.push(React.createElement(IconButton, { className: styles.actionButton, iconProps: { iconName: 'Add' }, title: "Add subtask", disabled: props.disabled, onClick: item.onClick }));
                    break;
                case 'commentAdd':
                    result.push(React.createElement(IconButton, { className: styles.actionButton, iconProps: { iconName: 'CommentAdd' }, title: "Add comment", disabled: props.disabled, onClick: item.onClick }));
                    break;
                case 'edit':
                    result.push(React.createElement(IconButton, { className: styles.actionButton, iconProps: { iconName: 'Edit' }, title: "Edit task", disabled: props.disabled, onClick: item.onClick }));
                    break;
                case 'logTime':
                    result.push(React.createElement(IconButton, { className: styles.actionButton, iconProps: { iconName: 'Clock' }, title: "Log time", disabled: props.disabled, onClick: item.onClick }));
                    break;
                case 'startTimer':
                    result.push(React.createElement(IconButton, { className: styles.actionButton, iconProps: { iconName: 'Play' }, title: "Start timer", disabled: props.disabled, onClick: item.onClick }));
                    break;
                case 'navigate':
                    result.push(React.createElement(IconButton, { className: styles.actionButton, iconProps: { iconName: 'OpenInNewWindow' }, title: "Navigate", disabled: props.disabled, onClick: item.onClick }));
                    break;
            }
        });
        return result;
    }, [props.items]);
    var overflowItems = React.useMemo(function () {
        if (!props.overflowItems)
            return [];
        var result = [];
        props.overflowItems.forEach(function (item) {
            switch (item.name) {
                case 'delete':
                    result.push({
                        key: 'delete',
                        text: 'Delete',
                        iconProps: {
                            iconName: 'Delete',
                        },
                        onClick: item.onClick,
                    });
                    break;
                case 'move':
                    result.push({
                        key: 'move',
                        text: 'Move',
                        iconProps: {
                            iconName: 'SIPMove',
                        },
                        onClick: item.onClick,
                    });
                    break;
            }
        });
        return result;
    }, [props.overflowItems]);
    return (React.createElement("div", { className: styles.container, style: style },
        items,
        props.overflowItems && (React.createElement(IconButton, { title: "More options", disabled: props.disabled, menuIconProps: { iconName: 'MoreVertical' }, className: styles.actionButton, menuProps: {
                items: overflowItems,
            } }))));
};
//# sourceMappingURL=index.js.map