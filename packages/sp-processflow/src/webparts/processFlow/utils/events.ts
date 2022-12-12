import { LOCATION_ADDED, PROCESS_ADDED, USER_PROCESS_ADDED, USER_PROCESS_UPDATE } from "./constants";

export type EventPayload = { id: number };

function dispatchEvent(event: string, id: number): void {
    document.dispatchEvent(new CustomEvent<EventPayload>(event, {
        detail: {
            id,
        }
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
    dispatchEvent(LOCATION_ADDED, 0);
}

export function listenEvent<T>(event: string, f: (data: T) => void): () => void {
    function handler(ev: CustomEvent<T>): void {
        f(ev.detail);
    }
    document.addEventListener(event, handler);
    return () => document.removeEventListener(event, handler);
}

export function listenUserProcessUpdated(f: (data: EventPayload) => void): () => void {
    return listenEvent<EventPayload>(USER_PROCESS_UPDATE, f);
}

export function listenUserProcessAdded(f: (data: EventPayload) => void): () => void {
    return listenEvent<EventPayload>(USER_PROCESS_ADDED, f);
}

export function listenProcessAdded(f: (data: EventPayload) => void): () => void {
    return listenEvent<EventPayload>(PROCESS_ADDED, f);
}

export function listenLocationAdded(f: (data: EventPayload) => void): () => void {
    return listenEvent<EventPayload>(LOCATION_ADDED, f);
}