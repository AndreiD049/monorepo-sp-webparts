import { range } from 'lodash';
import { IDropdownOption } from 'office-ui-fabric-react';
import { Item } from './item';
import { MainService } from './services/main-service';

export function optionsFromItems(items: Item[]): IDropdownOption[] {
    return items.map((i) => ({
        key: i.getFieldOr<string>('caption', i.Title),
        text: i.getFieldOr<string>('caption', i.Title),
    }));
}

export function hasBase64Src(image: HTMLImageElement): boolean {
    if (image.src.startsWith('data:image/')) {
        return true;
    } else {
        return false;
    }
}
export function base64ToBlob(dataURI: string): Blob {
    // Extract the base64-encoded data from the URI
    const base64Data = dataURI.split(',')[1];
    const type = dataURI.split(':')[1].split(';')[0];

    // Convert the base64-encoded data to a binary array
    const binaryData = atob(base64Data);
    const arrayData = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
        arrayData[i] = binaryData.charCodeAt(i);
    }
    return new Blob([arrayData], { type });
}

// Reads the html and searches for images with base64 data in them.
// if such images are found, their content is then attached to sharepoint and the new
export async function replaceImagesInHtml(html: string): Promise<string> {
    const div = document.createElement('div');
    div.innerHTML = html;
    const images = Array.from(div.querySelectorAll('img'));
    const calls = images.map(async (img) => {
        if (hasBase64Src(img)) {
            const blob = base64ToBlob(img.src);
            // eslint-disable-next-line require-atomic-updates
            img.src = await MainService.AttachmentService.attachFile(blob);
        }
    });

    await Promise.all(calls);

    return div.innerHTML;
}

export function listToColumnSplitter<T>(items: T[], cols: number): T[][] {
    if (cols === 1) return [items];
    const result: T[][] = range(0, cols).map(() => []);
    let idx = 0;
    items.forEach((item) => {
        if (result[idx] === undefined) result[idx] = [];
        result[idx].push(item);
        idx = (idx + 1) % cols;
    });
    return result;
}

export type PropTable = [string, string | number][];

/* eslint-disable @typescript-eslint/no-explicit-any */
export function objectToTable(obj: any, excludeKeys: RegExp): PropTable {
    const keys = Object.keys(obj)
        .filter((key) => excludeKeys.test(key) === false)
        .sort();
    const result: PropTable = [];
    keys.forEach((key) => {
        let value = obj[key];
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        result.push([key, value]);
    });
    return result;
}
