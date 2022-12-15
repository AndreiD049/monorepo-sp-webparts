import { IFlowLocation, IProcess, IUserProcess } from "@service/process-flow";
import { COPY_LOCATION, COPY_USER_PROCESS, LOCATIONS_ADDED, LOCATION_ADDED, LOCATION_DELETED, LOCATION_UPDATED, PASTE_LOCATION, PASTE_USER_PROCESS, PROCESS_ADDED, PROCESS_UPDATED, USER_PROCESS_ADDED, USER_PROCESS_UPDATE } from "./constants";

function dispatchEvent<T>(event: string, data: T): void {
    document.dispatchEvent(new CustomEvent<T>(event, {
        detail: data
    }))
}

export function userProcessUpdated(up: IUserProcess): void {
    dispatchEvent(USER_PROCESS_UPDATE, up);
}

export function userProcessAdded(up: IUserProcess): void {
    dispatchEvent(USER_PROCESS_ADDED, up);
}

export function processAdded(id: number): void {
    dispatchEvent(PROCESS_ADDED, id);
}

export function processUpdated(process: IProcess): void {
    dispatchEvent(PROCESS_UPDATED, process);
}

export function locationsAdded(): void {
    dispatchEvent(LOCATIONS_ADDED, 0);
}

export function locationAdded(location: IFlowLocation): void {
    dispatchEvent(LOCATION_ADDED, location);
}

export function locationUpdated(id: IFlowLocation): void {
    dispatchEvent(LOCATION_UPDATED, id);
}

export function locationDeleted(id: number): void {
    dispatchEvent(LOCATION_DELETED, id);
}

export function copyUserProcess(userProcess: IUserProcess): void {
    dispatchEvent(COPY_USER_PROCESS, userProcess);
}

export type PasteUserProcessData = { processId: number; userId: number; };

export function pasteUserProcess(data: PasteUserProcessData): void {
    dispatchEvent(PASTE_USER_PROCESS, data);
}


export function copyLocation(location: IFlowLocation | 'empty'): void {
    dispatchEvent(COPY_LOCATION, location);
}

type PasteLocationData = { processId: number, title: string };

export function pasteLocation(data: PasteLocationData): void {
    dispatchEvent(PASTE_LOCATION, data);
}

export function listenEvent<T>(event: string, f: (data: T) => void): () => void {
    function handler(ev: CustomEvent<T>): void {
        f(ev.detail);
    }
    document.addEventListener(event, handler);
    return () => document.removeEventListener(event, handler);
}

export function listenUserProcessUpdated(f: (data: IUserProcess) => void): () => void {
    return listenEvent<IUserProcess>(USER_PROCESS_UPDATE, f);
}

export function listenUserProcessAdded(f: (data: IUserProcess) => void): () => void {
    return listenEvent<IUserProcess>(USER_PROCESS_ADDED, f);
}

export function listenProcessAdded(f: (data: number) => void): () => void {
    return listenEvent<number>(PROCESS_ADDED, f);
}

export function listenProcessUpdated(f: (data: IProcess) => void): () => void {
    return listenEvent<IProcess>(PROCESS_UPDATED, f);
}

export function listenLocationsAdded(f: (data: number) => void): () => void {
    return listenEvent<number>(LOCATIONS_ADDED, f);
}

export function listenLocationAdded<T>(f: (data: T) => void): () => void {
    return listenEvent<T>(LOCATION_ADDED, f);
}

export function listenLocationUpdated(f: (data: IFlowLocation) => void): () => void {
    return listenEvent<IFlowLocation>(LOCATION_UPDATED, f);
}

export function listenLocationDeleted(f: (data: number) => void): () => void {
    return listenEvent<number>(LOCATION_DELETED, f);
}

export function listenUserProcessCopy(f: (data: IUserProcess) => void): () => void {
    return listenEvent<IUserProcess>(COPY_USER_PROCESS, f);
}

export function listenUserProcessPaste(f: (data: PasteUserProcessData) => void): () => void {
    return listenEvent<PasteUserProcessData>(PASTE_USER_PROCESS, f);
}

export function listenLocationCopy(f: (data: IFlowLocation | 'empty') => void): () => void {
    return listenEvent<IFlowLocation | 'empty'>(COPY_LOCATION, f);
}

export function listenLocationPaste(f: (data: PasteLocationData) => void): () => void {
    return listenEvent<PasteLocationData>(PASTE_LOCATION, f);
}
