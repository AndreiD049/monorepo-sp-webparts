import * as React from "react";


export interface ITimingProps {
    estimatedTime: number;
    effectiveTime: number;
}

const Timing: React.FC<ITimingProps> = (props) => {
    return (
        <div>
            <div>Estimated: {props.estimatedTime} hour(s)</div>
            <div>Effective: {props.effectiveTime} hour(s)</div>
        </div>
    )
};

export default Timing;