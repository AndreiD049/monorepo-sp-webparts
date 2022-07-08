import { RefObject, useEffect } from "react";

type IEventHandler = (e: Event) => void;

export const useDomEvent = (ref: RefObject<HTMLElement>, event: string, handler: IEventHandler, bubbles: boolean = false) => {
    useEffect(() => {
        if (ref.current) {
            ref.current.addEventListener(event, handler, bubbles);
        }
        return () => {
            if (ref.current) {
                ref.current.removeEventListener(event, handler);
            }
        }
    }, [ref]);
};
