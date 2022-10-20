import { Shimmer, ShimmerElementType, } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './TaskShimmer.module.scss';
export var TaskShimmer = function (props) {
    return (React.createElement("div", { className: styles.task }, props.rowProps.columns.map(function (column) {
        var shim;
        if (column.key === 'Title') {
            shim = (React.createElement(Shimmer, { style: { marginLeft: (props.parentNode.level + 1) * 30 }, shimmerElements: [
                    {
                        type: ShimmerElementType.circle,
                        width: 30
                    },
                    {
                        type: ShimmerElementType.gap,
                        width: 10,
                    },
                    {
                        type: ShimmerElementType.line,
                        width: column.calculatedWidth,
                    }
                ] }));
        }
        else {
            shim = (React.createElement(Shimmer, { width: column.calculatedWidth }));
        }
        return (React.createElement("div", { key: column.key, className: styles.taskCell, style: {
                width: column.calculatedWidth,
            } }, shim));
    })));
};
//# sourceMappingURL=index.js.map