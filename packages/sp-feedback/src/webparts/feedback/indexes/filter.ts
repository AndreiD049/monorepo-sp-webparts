/* eslint-disable @typescript-eslint/no-explicit-any */
const OP_KEYS = {
    $eq: true,
    $ne: true,
};
const LOGIC_KEYS = {
    $or: true,
    $and: true,
};

type OpKeys = keyof typeof OP_KEYS;
type LogicKeys = keyof typeof LOGIC_KEYS;
type SingleOp = { [key: string]: string }
type OpFilter = {
    [key in OpKeys]: SingleOp;
}
type LogicFilter = {
    [key in LogicKeys]: Filter[];
}
export type Filter = OpFilter & LogicFilter;

export function $eq(field: string, value: string): Filter {
    const result = Object.create(null);
    result.$eq = {
        [field]: value,
    };
    return result;    
}

export function $or(...filters: Filter[]): Filter {
    const result = Object.create(null);
    result.$or = filters;
    return result;
}

export function $and(...filters: Filter[]): Filter {
    const result = Object.create(null);
    result.$and = filters;
    return result;
}

export function parseFilter(filter: string): Filter {
    try {
        const obj = JSON.parse(filter);
        validateFilter(obj);
        return obj;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export function isOp(key: string): key is keyof typeof OP_KEYS {
    return key in OP_KEYS;
}

export function isLogicKey(key: string): key is keyof typeof LOGIC_KEYS {
    return key in LOGIC_KEYS;
}

function validateFilter(o: any): boolean {
    const keys = Object.keys(o);
    if (keys.length !== 1) throw Error(`Filter may have only 1 property: ${JSON.stringify(o)}`);
    const key = keys[0];
    if (key in OP_KEYS) {
        return validateFilter(o[key])
    }
    if (key in LOGIC_KEYS) {
        const filters: any[] = o[key];
        return filters.every((f) => validateFilter(f));
    }
    throw Error(`Invalid key: ${key}`);
}

export function getFilterKey(filter: Filter): OpKeys | LogicKeys {
    return Object.keys(filter)[0] as OpKeys | LogicKeys;
}

export function getFieldAndValue(filter: Filter): [string, string] {
    const key = getFilterKey(filter);
    if (isOp(key)) {
        const op = filter[key];
        const field = Object.keys(op)[0]
        return [field, op[field]];
    }
    return [null, null];
}