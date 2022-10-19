import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { CopyOnClickText } from '../../CopyOnClickText';
import styles from './TaskBody.module.scss';
var COPY_RE = /\[\[([^\]]+)\]\]/g;
// Text surrounded by [[ ]] should become clickable
// When user clicks it, it copies the text to clipboard
var parseText = function (text) {
    var tokens = Array.from(text.matchAll(COPY_RE));
    // If no tokens, return text as is
    var result = [];
    var startPivot = 0;
    tokens.forEach(function (token) {
        // Everything from startPivot to token is simple text
        result.push(React.createElement(React.Fragment, null, text.slice(startPivot, token.index)));
        // token becomes copy on click
        result.push(React.createElement(CopyOnClickText, { text: token[1], variant: 'smallPlus' }));
        startPivot = token.index + token[0].length;
    });
    // If there is any text left after startPivot, just include it as simple text
    if (startPivot < text.length) {
        result.push(React.createElement(React.Fragment, null, text.slice(startPivot)));
    }
    return (React.createElement(Text, { variant: 'smallPlus', className: styles.description }, result.map(function (e) { return e; })));
};
export var TaskBody = function (props) {
    return (React.createElement(React.Fragment, null,
        props.remark && (React.createElement(React.Fragment, null,
            React.createElement(Text, { className: styles.label, variant: "smallPlus" }, "Remark:"),
            parseText(props.remark))),
        props.description && (React.createElement(React.Fragment, null,
            React.createElement(Text, { className: styles.label, variant: "smallPlus" }, "Description:"),
            parseText(props.description)))));
};
//# sourceMappingURL=index.js.map