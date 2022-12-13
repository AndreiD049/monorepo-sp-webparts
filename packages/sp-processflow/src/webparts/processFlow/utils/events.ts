import { IFlowLocation } from "@service/process-flow";
import { LOCATIONS_ADDED, LOCATION_ADDED, LOCATION_DELETED, LOCATION_UPDATED, PROCESS_ADDED, USER_PROCESS_ADDED, USER_PROCESS_UPDATE } from "./constants";

function dispatchEvent<T>(event: string, data: T): void {
    document.dispatchEvent(new CustomEvent<T>(event, {
        detail: data
    }))
}

export function userProcessUpdated(id: number): void {
    dispatchEvent(USER_PROCESS_UPDATE, id);
}

export function userProcessAdded(id: number): void {
    dispatchEvent(USER_PROCESS_ADDED, id);
}

export function processAdded(id: number): void {
    dispatchEvent(PROCESS_ADDED, id);
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

export function listenEvent<T>(event: string, f: (data: T) => void): () => void {
    function handler(ev: CustomEvent<T>): void {
        f(ev.detail);
    }
    document.addEventListener(event, handler);
    return () => document.removeEventListener(event, handler);
}

export function listenUserProcessUpdated(f: (data: number) => void): () => void {
    return listenEvent<number>(USER_PROCESS_UPDATE, f);
}

export function listenUserProcessAdded(f: (data: number) => void): () => void {
    return listenEvent<number>(USER_PROCESS_ADDED, f);
}

export function listenProcessAdded(f: (data: number) => void): () => void {
    return listenEvent<number>(PROCESS_ADDED, f);
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