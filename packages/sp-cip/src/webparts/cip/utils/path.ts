export const PATH_SEP = '/';
export const PATH_BACK = '..';

/**
 * @description Modifies the path string so that it points to the new folder
 * '..' is a special case, it moves the file 'back one folder'
 * @param path original path
 * @param destinationFolder folder where file needs to be moved
 * @returns the modified path
 */
export function getMovedPath(path: string, destinationFolder: string): string {
    let pathTokens = path.split(PATH_SEP);
    const len = pathTokens.length;
    // Special case
    if (destinationFolder === PATH_BACK) {
        pathTokens.splice(len - 2, 1);
        return pathTokens.join(PATH_SEP);
    }
    pathTokens.splice(len - 1, 0, destinationFolder);
    return pathTokens.join(PATH_SEP);
}

/**
 * @description Assumes a path containing a filename is provided.
 * Will return back the base path without file name
 * @param path a string or array of strings representing a path
 * @returns the path as a string without filename
 */
export function getBasePath(path: string | string[]): string {
    let tokens = Array.isArray(path) ? path : path.split(PATH_SEP);
    return tokens.slice(0, -1).join(PATH_SEP);
}

/**
 * @description Assumes the file path provided already contains the name
 * @param path string or array of strings representing a path
 * @returns the filename
 */
export function getFileName(path: string | string[]): string {
    let tokens = Array.isArray(path) ? path : path.split(PATH_SEP);
    return tokens[tokens.length - 1];
}