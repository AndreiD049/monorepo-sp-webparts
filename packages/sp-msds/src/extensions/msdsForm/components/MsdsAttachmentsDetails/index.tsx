import { FormDisplayMode } from '@microsoft/sp-core-library';
import {
    Icon,
    IconButton,
    Label,
    PrimaryButton,
    Separator,
    Text,
} from '@fluentui/react';
import * as React from 'react';
import {
    FooterYesNo,
    hideDialog,
    hideSpinner,
    showDialog,
    showSpinner,
} from 'sp-components';
import { IAttachmentInfo } from 'sp-preset';
import { DIALOG_ID, SPINNER_ID } from '../../constants';
import { reloadAttachments } from '../../hooks/useAttachments';
import { ItemService } from '../../services/item-service';
import styles from './MsdsAttachmentsDetails.module.scss';

export interface IMsdsAttachmentsDetailsProps {
    id: string;
    displayMode: FormDisplayMode;
    attachments: IAttachmentInfo[];
    label: string;
    title?: string;
    required?: boolean;
    itemId: number;
}

const AttachmentPill: React.FC<{
    attachment: IAttachmentInfo;
}> = (props) => {
    const handleView = React.useCallback(async () => {
        window.open(
            await ItemService.getAttachmentUrl(
                props.attachment.ServerRelativePath.DecodedUrl
            ),
            '_blank',
            'noreferrer,noopener'
        );
    }, [props.attachment]);

    const handleDelete = React.useCallback(async () => {
        showDialog({
            id: DIALOG_ID,
            dialogProps: {
                dialogContentProps: {
                    title: 'Delete attachment',
                    subText:
                        'Attachment will be permanently deleted. Are you sure?',
                },
            },
            footer: (
                <FooterYesNo
                    onNo={() => hideDialog(DIALOG_ID)}
                    onYes={async () => {
                        hideDialog(DIALOG_ID);
                        await ItemService.deleteAttachment(
                            props.attachment.ServerRelativePath.DecodedUrl
                        );
                        reloadAttachments();
                    }}
                />
            ),
        });
    }, [props.attachment]);

    return (
        <div
            tabIndex={0}
            className={`${styles.attachmentPill} ${styles.attachment}`}
        >
            <Text title={props.attachment.FileName} className={styles.attachmentText} variant="medium">
                {props.attachment.FileName}
            </Text>
            <IconButton
                className={styles.attachmentIcon}
                iconProps={{ iconName: 'View' }}
                onClick={handleView}
            />
            <IconButton
                className={styles.attachmentIcon}
                iconProps={{ iconName: 'Delete' }}
                onClick={handleDelete}
            />
        </div>
    );
};

export const MsdsAttachmentsDetails: React.FC<IMsdsAttachmentsDetailsProps> = (
    props
) => {
    const input = React.useRef(null);
    const hasAttachments = props.attachments?.length > 0;

    const handleAddAttachment = React.useCallback(
        async (file: File) => {
            showSpinner(SPINNER_ID);
            await ItemService.addAttachment(props.itemId, file);
            reloadAttachments();
            hideSpinner(SPINNER_ID);
        },
        [props.itemId]
    );

    return (
        <div className={styles.container}>
            <Label htmlFor={props.id} required={props.required} title={props.title}>
                <Icon iconName="TextField" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <input
                id={props.id}
                type="file"
                ref={input}
                onChange={async (ev) => handleAddAttachment(ev.target.files[0])}
            />
            <PrimaryButton
                iconProps={{ iconName: 'Attach' }}
                onClick={() => input.current.click()}
            >
                Add attachments
            </PrimaryButton>
            {hasAttachments && (
                <>
                    <Separator />
                    {props.attachments.map((att) => (
                        <AttachmentPill
                            key={att.ServerRelativeUrl}
                            attachment={att}
                        />
                    ))}
                </>
            )}
        </div>
    );
};
