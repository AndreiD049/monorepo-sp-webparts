import { SECTION_EVENT } from "../../constants";

type SectionActions = 'REFRESH';

interface ISectionEventDetails {
    sectionName: string;
    action: SectionActions;
}

export const dispatchSectionHandler = (
    sectionName: string,
    action: SectionActions,
): void => {
    document.dispatchEvent(
        new CustomEvent<ISectionEventDetails>(SECTION_EVENT, {
            detail: {
                sectionName,
                action,
            },
        })
    );
};

export const listenSectionEvent = (sectionName: string, action: SectionActions, handler: () => void): () => void => {
    const resultHandler = (ev: CustomEvent<ISectionEventDetails>): void => {
        if (ev.detail.sectionName === sectionName && ev.detail.action === action) {
            handler();
        }
    }
    document.addEventListener(SECTION_EVENT, resultHandler);
    return () => document.removeEventListener(SECTION_EVENT, resultHandler);
}