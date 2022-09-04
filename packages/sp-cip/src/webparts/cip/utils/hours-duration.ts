import { MINUTE_DURATION } from './constants';

const hoursRg = /(\d{1,2}):?(\d{1,2})/;

export const formatHours = (value: number) => {
    if (value === 0) return '0';
    const hours = Math.floor(value);
    const min = Math.round((value % 1) / MINUTE_DURATION);
    return `${hours}:${min < 10 ? '0' : ''}${min}`;
};

/**
 * Getting a value like `01:15 hour(s)`
 * Returning like - 1.25
 */
export const validateHours = (value: string): number => {
    // Not valid - return 0
    if (!hoursRg.test(value)) return 0;
    const match = value.match(hoursRg);
    const hours = match[1] || 0;
    const minutes = match[2] || 0;
    return +hours + Math.round(+minutes * MINUTE_DURATION * 100) / 100;
};
