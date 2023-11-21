import * as React from 'react';
import { IFileInfo } from 'sp-preset';
import { AttachmentService } from '../../features/attachments/attachments-service';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';
import styles from './FeedbackAttachments.module.scss';
import { Icon } from 'office-ui-fabric-react';

export interface IFeedbackAttachmentsProps {
    feedbackId: number;
}

function getExtensionFromFileName(fileName: string): string {
    const parts = fileName.split('.');
    return parts[parts.length - 1];
}

export const FeedbackAttachments: React.FC<IFeedbackAttachmentsProps> = (
    props
) => {
    const [reload, setReload] = React.useState(false);
    const [attachments, setAttachments] = React.useState<IFileInfo[]>([]);

    React.useEffect(() => {
        if (props.feedbackId) {
            AttachmentService.getFeedbackAttachments(props.feedbackId)
                .then((attachments) => {
                    setAttachments(attachments);
                })
                .catch((error) => console.log(error));
        }
    }, [props.feedbackId, reload]);

    if (!props.feedbackId) {
        return null;
    }

    const handleDeleteAttachment = async (attachment: IFileInfo): Promise<void> => {
        // ask for confirmation
        const result = window.confirm(
            `Are you sure you want to delete ${attachment.Name}?`
        );

        if (result) {
            // delete attachment
            await AttachmentService.deleteFeedbackAttachment(
                attachment.ServerRelativeUrl
            );
            setReload(!reload);
        }
    };

    return (
        <div className={styles.container}>
            <div>
                <button
                    onClick={async () => {
                        const handles = await window.showOpenFilePicker({
                            multiple: true,
                        });
                        const files = await Promise.all(
                            handles.map((handle) => handle.getFile())
                        );
                        await AttachmentService.addAttachments(
                            props.feedbackId,
                            files
                        );
                        setReload(!reload);
                    }}
                >
                    Add attachment
                </button>
				<button style={{ marginLeft: 10 }} onClick={async () => {
					const link = await AttachmentService.getFeedbackFolderShareLink(props.feedbackId);
					if (link && link.sharingLinkInfo) {
							window.open(
								link.sharingLinkInfo.Url,
								'_blank',
								'noreferrer'
							);
					}
				}}>Open folder</button>
            </div>
            {attachments.map((attachment) => {
                return (
                    <div
                        key={attachment.Name}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Icon
                            {...getFileTypeIconProps({
                                extension: getExtensionFromFileName(
                                    attachment.Name
                                ),
                                size: 32,
                            })}
                        />
                        {attachment.Name}
                        <div style={{ marginLeft: 10 }}>
                            <button
                                onClick={async () => {
                                    const link =
                                        await AttachmentService.getAttachmentShareLink(
                                            attachment.ServerRelativeUrl
                                        );
                                    if (
                                        link &&
                                        link.sharingLinkInfo &&
                                        link.sharingLinkInfo.Url
                                    ) {
                                        window.open(
                                            link.sharingLinkInfo.Url,
                                            '_blank',
                                            'noreferrer'
                                        );
                                    }
                                }}
                            >
                                Open
                            </button>
                            <button
                                style={{ marginLeft: 10 }}
                                onClick={() =>
                                    handleDeleteAttachment(attachment)
                                }
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
