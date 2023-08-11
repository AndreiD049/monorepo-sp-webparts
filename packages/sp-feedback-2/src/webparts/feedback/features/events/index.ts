export type Identifier<T> = {
	id: number;
	value: T;
}
export type EventTypes = 'tag-add' | 'tag-delete' | 'feedback-updated';

export function on<T>(
    event: EventTypes,
    cb: (a: CustomEvent<T>) => void
): () => void {
    document.addEventListener(event, cb);

    return () => {
        document.removeEventListener(event, cb);
    };
}

export function dispEvent<T>(event: EventTypes, payload: T) {
	document.dispatchEvent(
        new CustomEvent(event, {
            detail: payload,
        })
    );
}
