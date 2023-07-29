type Identifier<T> = {
	id: number;
	value: T;
}
export type EventTypes = 'tag-add' | 'tag-delete';
type EventTypeDetails = {
    'tag-add': Identifier<string>;
    'tag-delete': Identifier<string>;
};

export function on(
    event: EventTypes,
    cb: (a: CustomEvent<EventTypeDetails[typeof event]>) => void
): () => void {
    document.addEventListener(event, cb);

    return () => {
        document.removeEventListener(event, cb);
    };
}

export function dispEvent(event: EventTypes, payload: EventTypeDetails[typeof event]) {
	document.dispatchEvent(
        new CustomEvent(event, {
            detail: payload,
        })
    );
}
