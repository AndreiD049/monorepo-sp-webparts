import * as React from 'react';
import { IAttachmentInfo } from 'sp-preset';
import { ItemService } from '../services/item-service';

export const RELOAD_ATT_EVT = 'sp-msds/reloadAttachmentsEvent';
export function reloadAttachments(): void {
    document.dispatchEvent(new CustomEvent(RELOAD_ATT_EVT));
}

export function useAttachments(itemId: number): IAttachmentInfo[] {
    const [reload, setReload] = React.useState(false);
    const [attachments, setAttachments] = React.useState<IAttachmentInfo[]>([]);

    React.useEffect(() => {
        if (itemId) {
            ItemService.getAttachments(itemId)
                .then((att) => setAttachments(att))
                .catch((err) => console.error(err));
        }
    }, [itemId, reload]);

    React.useEffect(() => {
        function run(): void {
            setReload((prev) => !prev);
        }
        document.addEventListener(RELOAD_ATT_EVT, run);
        return () => document.removeEventListener(RELOAD_ATT_EVT, run);
    }, []);

    return attachments;
}
