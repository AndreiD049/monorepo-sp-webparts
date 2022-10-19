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
                    width: '100%',
                    borderRadius: '5px',
                }, onClick: function () { return props.handleClick(choice); }, value: choice, disabled: taskDisabled, className: "sp-cip-pill-".concat(choice.toLowerCase()) }));
        });
    }, [props.choices, props.currentChoice]);
    return React.createElement("div", { className: styles.text }, choices);
};
export var PriorityCell = function (props) {
    var containerRef = React.useRef(null);
    var calloutId = React.useMemo(function () { return (props.calloutId ? props.calloutId : CALLOUT_ID); }, []);
    return (React.createElement("div", { ref: containerRef },
        React.createElement(Pill, { onClick: function () {
                return showCallout({
                    id: calloutId,
                    calloutProps: {
                        target: containerRef,
                        directionalHint: DirectionalHint.bottomCenter,
                    },
                    content: (React.createElement(PriorityCellCallout, { choices: ['Low', 'Medium', 'High'], currentChoice: props.task.Priority, handleClick: function (choice) {
                            props.onChangePriority(choice);
                            hideCallout(calloutId);
                        } })),
                });
            }, style: {
                height: '100%',
                width: '100%',
                borderRadius: '5px',
            }, className: "sp-cip-pill-".concat(props.task.Priority.toLowerCase()), value: props.task.Priority, disabled: props.disabled }),
        props.calloutId ? null : React.createElement(Callout, { id: CALLOUT_ID })));
};
//# sourceMappingURL=index.js.map