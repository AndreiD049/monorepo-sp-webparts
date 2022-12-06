export function swap<T>(arr: T[], idx1: number, idx2: number): T[] {
    const copy = [...arr];
    const temp = copy[idx1];
    copy[idx1] = copy[idx2];
    copy[idx2] = temp;
    return copy;
}