/**
 * @description Modifies the path string so that it points to the new folder
 * '..' is a special case, it moves the file 'back one folder'
 * @param path original path
 * @param destinationFolder folder where file needs to be moved
 * @returns the modified path
 */
export function getMovedPath(path: string, destinationFolder: string): string {
    let pathTokens = path.split('/');
    const len = pathTokens.length;
    // Special case
    if (destinationFolder === '..') {
        pathTokens.splice(len - 2, 1);
        return pathTokens.join('/');
    }
    pathTokens.splice(len - 1, 0, destinationFolder);
    return pathTokens.join('/');
}