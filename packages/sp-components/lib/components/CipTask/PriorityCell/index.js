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
import { Pill } from '../../Pill';
import styles from './PriorityCell.module.scss';
import { Callout, hideCallout, showCallout } from '../../Callout';
import { DirectionalHint } from 'office-ui-fabric-react';
var CALLOUT_ID = 'sp-components-priority';
var PriorityCellCallout = function (props) {
    var choices = React.useMemo(function () {
        return props.choices.map(function (choice) {
            var taskDisabled = props.currentChoice.toLowerCase() === choice.toLowerCase();
            return (React.createElement(Pill, { key: choice, style: {
                    height: '100%',
                    width: '100px',
                    borderRadius: '5px',
                }, onClick: function () {
                    props.handleClick(choice);
                }, value: choice, disabled: taskDisabled, className: "sp-cip-pill-".concat(choice.toLowerCase()) }));
        });
    }, [props]);
    return React.createElement("div", { className: styles.text }, choices);
};
export var PriorityCell = function (_a) {
    var _b = _a.style, style = _b === void 0 ? {} : _b, _c = _a.className, className = _c === void 0 ? '' : _c, props = __rest(_a, ["style", "className"]);
    var containerRef = React.useRef(null);
    var calloutId = React.useMemo(function () { return (props.calloutId ? props.calloutId : "".concat(CALLOUT_ID, "/").concat(props.task.Id)); }, []);
    return (React.createElement("div", { ref: containerRef, className: "".concat(styles.container, " ").concat(className), style: style },
        React.createElement(Pill, { onClick: function () {
                return showCallout({
                    id: calloutId,
                    calloutProps: {
                        target: containerRef,
                        directionalHint: DirectionalHint.bottomCenter,
                    },
                    content: (React.createElement(PriorityCellCallout, { choices: props.choices, currentChoice: props.task.Priority, handleClick: function (choice) {
                            props.onChangePriority(choice);
                            hideCallout(calloutId);
                        } })),
                });
            }, style: {
                height: '100%',
                width: '100%',
                borderRadius: '5px',
            }, className: "sp-cip-pill-".concat(props.task.Priority.toLowerCase()), value: props.task.Priority, disabled: props.disabled }),
        props.calloutId ? null : React.createElement(Callout, { id: calloutId })));
};
//# sourceMappingURL=index.js.map