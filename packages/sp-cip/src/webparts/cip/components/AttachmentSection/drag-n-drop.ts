import { IAttachmentFile } from "@service/sp-cip/dist/models/IAttachmentFile";
import { isArrayLikeObject } from "lodash";
import { DragEvent } from "react";
import styles from './AttachmentSection.module.scss';

export interface IDropItem {
    type: 'item' | 'file';
    data: string | File[];
}

export const SP_FILE_TYPE = 'spfile';
var currentDropContainer: HTMLElement = null;

function changeCurrentDropContainer(element: HTMLElement | null) {
    if (currentDropContainer !== null) {
        currentDropContainer.classList.remove(styles.dropzoneDraggingOver);
    }
    currentDropContainer = element;
}

function isFileTypeAccepted(items: DataTransferItemList, fileTypes: string) {
    if (!fileTypes) return true;
    const itemsList = Array.from(items);
    console.log(itemsList[0].type);
    return itemsList.every((i) => i.type === '' ? false : fileTypes.includes(i.type)) === false;
}

export function onDragEnter(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    const target = evt.currentTarget as HTMLDivElement;
    if (target.dataset.dropzone && isFileTypeAccepted(evt.dataTransfer.items, target.dataset.rejects)) {
        changeCurrentDropContainer(target);
        target.classList.add(styles.dropzoneDraggingOver);
    }
}

export function onDragOver(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
}

export function onDragLeave(evt: DragEvent) {
    evt.stopPropagation();
    // related is the element where we land after leave
    const related = evt.relatedTarget as HTMLElement;
    if (currentDropContainer && !currentDropContainer.contains(related)) {
        changeCurrentDropContainer(null);
    }
}

export function onDrop(handler: (item: IDropItem) => void) {
    return (evt: DragEvent) => {
        evt.stopPropagation();
        evt.preventDefault();
        const files = Array.from(evt.dataTransfer.files);
        if (files.length) {
            handler({
                type: 'file',
                data: files,
            })
        } else {
            Array.from(evt.dataTransfer.items).forEach((item) => item.getAsString((name) => handler({
                type: 'item',
                data: name,
            })));
        }
        changeCurrentDropContainer(null);
    }
}

export function onDragEnd(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    changeCurrentDropContainer(null);
}

/**
 * When user starts dragging an existing sharepoint attachment (perhaps to another folder)
 * Set the dataTransfer items
 */
export function onDragStart(file: IAttachmentFile) {
    return (evt: DragEvent) => {
        evt.dataTransfer.setData(SP_FILE_TYPE, file.ServerRelativeUrl);
    }
}