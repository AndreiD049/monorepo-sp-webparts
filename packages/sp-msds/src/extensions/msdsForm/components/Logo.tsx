/* eslint-disable react/self-closing-comp */
import * as React from 'react';

export const Logo: React.FC<{
    style: React.CSSProperties;
}> = (props) => (
    <div title="This field will affect PLATO">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            viewBox="0 0 1080 1080"
            xmlSpace="preserve"
            style={props.style}
        >
            <desc>Created with Fabric.js 5.2.4</desc>
            <defs></defs>
            <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="transparent"
            ></rect>
            <g
                transform="matrix(1 0 0 1 540 540)"
                id="022db8ca-a356-480d-a26f-b66ade971266"
            >
                <rect
                    className="backgroundPrimaryFill"
                    style={{
                        stroke: 'none',
                        strokeWidth: 1,
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: 0,
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4,
                        fillRule: 'nonzero',
                        opacity: 1,
                        visibility: 'hidden',
                    }}
                    vector-effect="non-scaling-stroke"
                    x="-540"
                    y="-540"
                    rx="0"
                    ry="0"
                    width="1080"
                    height="1080"
                />
            </g>
            <g
                transform="matrix(1 0 0 1 540 540)"
                id="447648b8-164b-4ccb-a56c-0bf14cb45e10"
            ></g>
            <g
                transform="matrix(27 0 0 27 540 540)"
                clip-path="url(#CLIPPATH_6)"
            >
                <clipPath id="CLIPPATH_6">
                    <rect
                        transform="matrix(1 0 0 1 0 0)"
                        id="clip-Invoice_favicon"
                        x="-20"
                        y="-20"
                        rx="0"
                        ry="0"
                        width="40"
                        height="40"
                    />
                </clipPath>
                <path
                    className="backgroundPrimaryFill"
                    style={{
                        stroke: 'none',
                        strokeWidth: 1,
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: 0,
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4,
                        fillRule: 'nonzero',
                        opacity: 1,
                    }}
                    vector-effect="non-scaling-stroke"
                    transform=" translate(-20.35, -20)"
                    d="M 5.353 11.15 L 5.353 29.273 L 20.344 40 L 35.353 29.275 L 35.353 11.144 L 20.353 0 Z"
                    stroke-linecap="round"
                />
            </g>
            <g
                transform="matrix(3.69 0 0 3.69 540 540)"
                id="59779b44-b982-4c98-b0c0-c8ff8d19f8d8"
            >
                <text
                    xmlSpace="preserve"
                    font-family="Raleway"
                    font-size="200"
                    font-style="normal"
                    font-weight="700"
                    style={{
                        stroke: 'none',
                        strokeWidth: 1,
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: 0,
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: 4,
                        fill: 'rgb(255,255,255)',
                        fillRule: 'nonzero',
                        opacity: 1,
                        whiteSpace: 'pre',
                    }}
                >
                    <tspan x="-61.08" y="62.83">
                        P
                    </tspan>
                </text>
            </g>
        </svg>
    </div>
);
