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
import * as React from 'react';
import { Callout as FluentCallout, DirectionalHint } from 'office-ui-fabric-react';
var EVENT_PREFIX = 'sp-callout-visibility';
export var showCallout = function (props) {
    document.dispatchEvent(new CustomEvent("".concat(EVENT_PREFIX, "/").concat(props.id), {
        detail: __assign(__assign({}, props), { visible: true })
    }));
};
export var hideCallout = function (id) {
    document.dispatchEvent(new CustomEvent("".concat(EVENT_PREFIX, "/").concat(id), {
        detail: {
            calloutProps: {
                target: null,
            },
            content: null,
            visible: false,
            id: id,
        }
    }));
};
export var Callout = function (props) {
    var eventName = "".concat(EVENT_PREFIX, "/").concat(props.id);
    var _a = React.useState({
        target: null,
        directionalHint: DirectionalHint.bottomCenter,
    }), calloutProps = _a[0], setCalloutProps = _a[1];
    var _b = React.useState(null), renderComponent = _b[0], setRenderComponent = _b[1];
    var _c = React.useState(false), visible = _c[0], setVisible = _c[1];
    React.useEffect(function () {
        function visibilityHandler(evt) {
            if (evt.detail.id === props.id) {
                setCalloutProps(evt.detail.calloutProps);
                setRenderComponent(evt.detail.content);
                setVisible(evt.detail.visible);
            }
        }
        document.addEventListener(eventName, visibilityHandler);
        return function () { return document.removeEventListener(eventName, visibilityHandler); };
    }, []);
    if (!visible)
        return null;
    return (React.createElement(FluentCallout, __assign({}, calloutProps, { onDismiss: function () { return hideCallout(props.id); } }), renderComponent));
};
//# sourceMappingURL=index.js.map