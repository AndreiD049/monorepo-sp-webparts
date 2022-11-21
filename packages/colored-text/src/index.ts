import { COLORS, ITextColor } from "./colormap";

/**
 *  Simple hash function for a string
 *  For every char, sum it's char code number multiplied by (position + 1)
 *  Returns a number
 */
function getStringHash(text: string): number {
    if (!text) return 0;
    let sum = 0;
    for (let i = 0; i < text.length; i++) {
        sum += (text.charCodeAt(i) * (i + 1));
    }
    return sum;
}

export function textColor(text: string): ITextColor {
    const idx = getStringHash(text) % COLORS.length;
    return COLORS[idx];
}

export {
    ITextColor,
}
