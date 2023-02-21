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
