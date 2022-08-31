export function getMonthDayLabel(day: number, suffix: string = 'day') {
    switch (day) {
        case 1:
            return `1st ${suffix}`;
        case 2:
            return `2nd ${suffix}`;
        case 3:
            return `3rd ${suffix}`;
        default:
            return `${day}th ${suffix}`;
    }
}