import { Icon, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './CheckExpandButton.module.scss';
var SubtaskCounter = function (_a) {
    var subtasks = _a.subtasks, finishedSubtasks = _a.finishedSubtasks;
    return (React.createElement("div", { className: styles.subtaskCounter },
        React.createElement("span", null, finishedSubtasks),
        React.createElement("span", { className: styles.subtaskCounterDelimiter }, "|"),
        React.createElement("span", null, subtasks)));
};
export var CheckExpandButton = function (props) {
    var button = React.useRef(null);
    var classNames = React.useMemo(function () {
        var result = styles.roundButton;
        if (!props.disabled && props.totalSubtasks === props.finishedSubtasks) {
            result += " ".concat(props.taskFinished
                ? styles.roundButtonFinished
                : styles.roundButtonOpen);
        }
        return result;
    }, [props.disabled, props.totalSubtasks, props.finishedSubtasks, props.taskFinished]);
    var content = React.useMemo(function () {
        if (props.totalSubtasks > 0 && props.finishedSubtasks !== props.totalSubtasks) {
            return React.createElement(SubtaskCounter, { subtasks: props.totalSubtasks, finishedSubtasks: props.finishedSubtasks });
        }
        else {
            return (React.createElement(Icon, { iconName: "".concat(props.taskFinished ? 'Cancel' : 'CheckMark') }));
        }
    }, [props.finishedSubtasks, props.totalSubtasks, props.taskFinished]);
    var expandButton = React.useMemo(function () {
        if (props.totalSubtasks > 0) {
            return (React.createElement(IconButton, { onClick: function () { return props.onToggleOpen(props.taskId, !props.open); }, iconProps: {
                    iconName: "".concat(props.open ? 'ChevronDown' : 'ChevronRight'),
                } }));
        }
        return null;
    }, [props.open]);
    return (React.createElement("div", { className: "".concat(styles.container, " ").concat(props.totalSubtasks > 0
            ? ''
            : styles.containerEmpty), onDoubleClick: function (evt) { return evt.stopPropagation(); } },
        React.createElement("button", { disabled: props.disabled, ref: button, id: "task-".concat(props.taskId), "data-taskid": props.taskId, onClick: props.onClick, className: classNames }, content),
        expandButton));
};
//# sourceMappingURL=index.js.map