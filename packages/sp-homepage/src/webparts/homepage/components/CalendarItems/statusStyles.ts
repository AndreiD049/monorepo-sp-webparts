import { CSSProperties } from "react";

const statusColors: {[status: string]: CSSProperties} = {
    "new": {
        color: '#0068b8',
        backgroundColor: '#d4e7f6'
    },
	"open": {
        color: '#0068b8',
        backgroundColor: '#d4e7f6'
    },
    'on-hold': {
        color: '#8f6200',
        backgroundColor: '#ffebc0'
    },
    'in-progress': {
        color: '#004e8c',
        backgroundColor: '#80c6ff'
    },
    'on-going': {
        color: '#004e8c',
        backgroundColor: '#80c6ff'
    },
    'planned': {
        color: '#004e8c',
        backgroundColor: '#80c6ff'
    },
    'blocked': {
        color: '#aa272b',
        backgroundColor: '#f5cccf'
    },
    'waiting for requester': {
        color: '#000000',
        backgroundColor: '#42f5a1'
    },
    'waiting for 3rd party': {
        color: '#60356e',
        backgroundColor: '#e180ff'
    }
}

export function getStatusStyles(status: string): CSSProperties {
    const prop = status.toLowerCase();
    if (!(prop in statusColors)) {
        return {};
    }
    return statusColors[prop];
}
