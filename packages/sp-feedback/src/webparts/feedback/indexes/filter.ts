import { cloneDeep } from '@microsoft/sp-lodash-subset';

/* eslint-disable @typescript-eslint/no-explicit-any */
const FILTER_OPS_OBJ = {
    $eq: true,
    $ne: true,
};
const LOGIC_OPS_OBJ = {
    $or: true,
    $and: true,
};

type FilterOps = keyof typeof FILTER_OPS_OBJ;
type LogicOps = keyof typeof LOGIC_OPS_OBJ;
type SingleOp = { [key: string]: string };
type OpFilter = {
    [key in FilterOps]: SingleOp;
};
export type PathTokens = LogicOps | number;
type ValueType = string | string[];
type LogicFilter = {
    [key in LogicOps]: Filter[];
};
export type Filter = OpFilter & LogicFilter;

export const FILTER_OPS = Object.keys(FILTER_OPS_OBJ);
export const LOGIC_OPS = Object.keys(LOGIC_OPS_OBJ);
export const ALL_OPS = [...FILTER_OPS, ...LOGIC_OPS];

export function genericFilterOp(
    op: string,
    field: string,
    value: ValueType
): Filter {
    const isFilter = isFilterOp(op);
    if (!isFilter) {
        throw Error(`Invalid operation '${op}'`);
    }
    const result = Object.create(null);
    result[op] = {
        [field]: value,
    };
    return result;
}

export function genericLogicOp(op: LogicOps, filters: Filter[]): Filter {
    const isLogic = isLogicOp(op);
    if (!isLogic) {
        throw Error(`Invalid operation '${op}'`);
    }
    const result = Object.create(null);
    result[op] = filters;
    return result;
}

export function $eq(field: string, value: ValueType): Filter {
    return genericFilterOp('$eq', field, value);
}

export function $ne(field: string, value: ValueType): Filter {
    return genericFilterOp('$ne', field, value);
}

export function $or(...filters: Filter[]): Filter {
    return genericLogicOp('$or', filters);
}

export function $and(...filters: Filter[]): Filter {
    return genericLogicOp('$and', filters);
}
export function isFilterOp(key: string): key is keyof typeof FILTER_OPS_OBJ {
    return key in FILTER_OPS_OBJ;
}

export function isLogicOp(key: string): key is keyof typeof LOGIC_OPS_OBJ {
    return key in LOGIC_OPS_OBJ;
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

function validateFilter(o: any): boolean {
    const keys = Object.keys(o);
    if (keys.length !== 1)
        throw Error(`Filter may have only 1 property: ${JSON.stringify(o)}`);
    const key = keys[0];
    if (key in FILTER_OPS_OBJ) {
        return true;
    }
    if (key in LOGIC_OPS_OBJ) {
        const filters: any[] = o[key];
        return filters.every((f) => validateFilter(f));
    }
    throw Error(`Invalid key: ${key}`);
}

export function getFilterOp(filter: Filter): FilterOps | LogicOps {
    if (!filter) return null;
    return Object.keys(filter)[0] as FilterOps | LogicOps;
}

export function getFieldAndValue(filter: Filter): [string, string] {
    const key = getFilterOp(filter);
    if (isFilterOp(key)) {
        const op = filter[key];
        const field = Object.keys(op)[0];
        return [field, op[field]];
    }
    return [null, null];
}

export function traversePath(
    filter: Filter | Filter[],
    path: PathTokens[]
): Filter | Filter[] {
    if (!path) return filter as Filter;
    if (path.length === 0) return filter as Filter;
    const key = path[0];
    if (typeof key === 'string' && !Array.isArray(filter)) {
        if (!(key in filter)) {
            throw Error(
                `No key in filter - '${key}'. (${JSON.stringify(
                    filter,
                    null,
                    4
                )})`
            );
        }
        return traversePath(filter[key as LogicOps], path.slice(1));
    } else if (Array.isArray(filter) && typeof key === 'number') {
        if (filter.length < key - 1) {
            throw Error(
                `There is no filter at index - ${key}. (${JSON.stringify(
                    filter,
                    null,
                    4
                )})`
            );
        }
        return traversePath(filter[key], path.slice(1));
    }
    throw Error(
        `Invalid filter or path: ${path}, ${JSON.stringify(filter, null, 4)}`
    );
}

export function replaceAtPath(
    filter: Filter,
    newFilter: Filter | Filter[],
    path: PathTokens[]
): Filter {
    if (!path || path.length === 0) {
        if (Array.isArray(newFilter))
            throw Error(`Path is empty. newFilter should be of type Filter`);
        return newFilter;
    }
    const result = cloneDeep(filter);
    const [head, lastToken] = splitPath(path);
    const valueToReplce = traversePath(result, head);
    if (typeof lastToken === 'number') {
        (valueToReplce as Filter[]).splice(lastToken, 1, newFilter as Filter);
    } else {
        (valueToReplce as Filter)[lastToken] = newFilter as Filter[];
    }
    return result;
}

export function insertAtPath(
    filter: Filter,
    value: Filter,
    path: PathTokens[]
): Filter {
    if (!filter || path.length === 0) {
        return cloneDeep(value);
    }
    const result = cloneDeep(filter);
    const [head, lastToken] = splitPath(path);
    const placeToInsert = traversePath(result, head);
    if (typeof lastToken !== 'number') {
        throw Error(`Last token in path expected to be number`);
    }
    if (!Array.isArray(placeToInsert)) {
        throw Error(
            `Expected to find array. Found ${JSON.stringify(
                placeToInsert,
                null,
                4
            )}`
        );
    }
    placeToInsert.splice(lastToken, 0, value);
    return result;
}

/**
 * Takes an operation, a filter and a path
 * and returns a new filter that has the new operation inserted
 * at the given path.
 * Example: 
 * let filter = $eq('tags', 'test');
 * insertOpAfter('$eq', filter, []); // => $and($eq('tags', 'test'), $eq('tahs', ''))
 * @param newOp the new operation to be inserted
 * @param oldFilter the old filter
 * @param path the path to the element after which the operation has to be inserted
 * @returns the new filter with the operation inserted
 */
export function insertOpAfter(
    newOp: string,
    oldFilter: Filter,
    path: PathTokens[]
): Filter {
    const newFilter = getEmptyFilter(newOp);
    if (!oldFilter) {
        return newFilter;
    }
    if (path.length === 0) {
        return $and(oldFilter, newFilter);
    }
    return insertAtPath(oldFilter, newFilter, incPath(path));
}

export function removeAtPath(filter: Filter, path: PathTokens[]): Filter {
    if (!path || path.length === 0) return null;
    const result = cloneDeep(filter);
    const [head, lastToken] = splitPath(path);
    const placeToRemove = traversePath(result, head);
    if (typeof lastToken !== 'number') {
        throw Error(`Last token in path expected to be number`);
    }
    if (!Array.isArray(placeToRemove)) {
        throw Error(
            `Expected to find array. Found ${JSON.stringify(
                placeToRemove,
                null,
                4
            )}`
        );
    }
    placeToRemove.splice(lastToken, 1);
    return result;
}

export function getAllowedBefore(path: PathTokens[]): string[] {
    if (!path || path.length === 0) return ALL_OPS;
    const lastToken = path[path.length - 1];
    if (typeof lastToken === 'number') {
        // path.length is not 0, so we can insert any operations
        return ALL_OPS;
    } else {
        return null;
    }
}

export function getAllowedOps(path: PathTokens[], filter: Filter): string[] {
    if (!path) return [];
    if (path.length === 0 && !filter) return ALL_OPS;
    const op = getFilterOp(filter);
    if (path.length === 0 && isLogicOp(op)) return LOGIC_OPS;
    if (path.length === 0 && isFilterOp(op)) return ALL_OPS;
    const lastToken = path[path.length - 1];
    if (typeof lastToken === 'number') {
        // path.length is not 0, so we can insert any operations
        return ALL_OPS;
    } else {
        return [];
    }
}

export function changeField(
    filter: Filter,
    path: PathTokens[],
    newField: string
): Filter {
    const result = cloneDeep(traversePath(filter, path));
    if (Array.isArray(result)) throw Error(`Expected single filter path`);
    const op = getFilterOp(result);
    const [oldField, value] = getFieldAndValue(result);
    if (oldField === newField) return result;
    if (isFilterOp(op)) {
        result[op][newField] = value;
        delete result[op][oldField];
    }
    return result;
}

export function changeOp(
    filter: Filter,
    path: PathTokens[],
    newOp: string
): Filter {
    const result = cloneDeep(traversePath(filter, path));
    if (Array.isArray(result)) throw Error(`Expected single filter path`);
    const op = getFilterOp(result);
    if (newOp === op) return result;
    if (isFilterOp(newOp) && isFilterOp(op)) {
        result[newOp] = result[op];
        delete result[op];
    } else if (isLogicOp(newOp) && isLogicOp(op)) {
        result[newOp] = result[op];
        delete result[op];
    }
    return result;
}

export function changeValue(
    filter: Filter,
    path: PathTokens[],
    newValue: string
): Filter {
    const result = cloneDeep(traversePath(filter, path));
    if (Array.isArray(result)) throw Error(`Expected single filter path`);
    const op = getFilterOp(result);
    const [oldField] = getFieldAndValue(result);
    if (isFilterOp(op)) {
        result[op][oldField] = newValue;
    }
    return result;
}

export function incPath(path: PathTokens[]): PathTokens[] {
    const newPath = [...path];
    if (path.length === 0) return newPath;
    const lastToken = newPath[newPath.length - 1];
    if (lastToken === undefined || typeof lastToken !== 'number') {
        throw Error(`Invalid last token in path ${newPath}. Expected number.`);
    }
    newPath[newPath.length - 1] = lastToken + 1;
    return newPath;
}

export function getEmptyFilter(op: string): Filter {
    if (isFilterOp(op)) {
        return genericFilterOp(op, 'tags', '');
    } else if (isLogicOp(op)) {
        return genericLogicOp(op, []);
    }
}

function splitPath(path: PathTokens[]): [PathTokens[], PathTokens] {
    if (!path) return [[], null];
    const head = path.slice(0, -1);
    const tail = path[path.length - 1];
    return [head, tail];
}
