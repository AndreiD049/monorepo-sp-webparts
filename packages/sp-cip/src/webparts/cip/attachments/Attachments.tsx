import { DefaultButton, Icon, Label, Link, Stack, Text, themeRulesStandardCreator } from 'office-ui-fabric-react';
import { useControlledState } from 'office-ui-fabric-react/lib/Foundation';
import * as React from 'react';
import { FileInput } from '../components/Utils/FileInput';
import { ITaskOverview } from '../tasks/ITaskOverview';
import { GlobalContext } from '../utils/GlobalContext';
import { IAttachment } from './IAttachment';
import { useAttachments } from './useAttachments';
import styles from './Attachments.module.scss';
import { getAlert } from '../components/AlertDialog';

interface IAttachmentsProps {
    task: ITaskOverview;
}

const getFileIconName = (name: string) => {
    const tokens = name.split('.');
    const extension = tokens[tokens.length - 1].toLowerCase();
    switch (extension) {
        case 'xls':
        case 'xlsx':
        case 'xlsm':
            return 'ExcelDocument'
        case 'docx':
        case 'rtf':
            return 'WordDocument'
        case 'pdf':
            return 'PDF'
        case 'jpg':
        case 'png':
        case 'jpeg':
            return 'FileImage';
        case 'html':
        case 'xml':
        case 'xsl':
        case 'xslt':
            return 'FileHTML';
        case 'txt':
            return 'FileCSS';
        default:
            return 'FileTemplate'
    }
}

export interface IAttachmentProps {
    attachment: IAttachment;
    task: ITaskOverview;
    setAttachments: React.Dispatch<React.SetStateAction<IAttachment[]>>;
}

const Attachment: React.FC<IAttachmentProps> = (props) => {
    const { properties, theme } = React.useContext(GlobalContext);
    const {
        getAttachmentsRequest,
        removeAttachment,
    } = useAttachments();

    const linkHref = React.useCallback((file: string) => {
        const url = getAttachmentsRequest(props.task).toRequestUrl();
        const re = /sharepoint.com(\/(sites|teams).*)\/_api/;
        const match = url.match(re);
        const site = match ? match[1] : '';
        return `${site}/${properties.attachmentsPath}/Forms/AllItems.aspx?id=${site}/${properties.attachmentsPath}/${props.task.Id}/${file}&parent=${site}/${props.task.Id}`;
    }, []);

    const downloadLinkHref = React.useCallback((file: string) => {
        const url = getAttachmentsRequest(props.task).toRequestUrl();
        const re = /sharepoint.com(\/(sites|teams).*)\/_api/;
        const match = url.match(re);
        const site = match ? match[1] : '';
        return `${site}/_layouts/download.aspx?SourceUrl=${site}/${properties.attachmentsPath}/${props.task.Id}/${file}`;
    }, []);

    const fileIcon = React.useMemo(() => getFileIconName(props.attachment.Name), []);

    return (
        <div className={styles.attachment}>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <Icon iconName={fileIcon} className={styles['attachment__fileicon']} />
                <Text title={props.attachment.Name} variant='smallPlus' className={styles['attachment__filename']}>{props.attachment.Name}</Text>
            </Stack>
            <div className={styles.attachment__links}>
                <Link
                    data-interception="off"
                    underline={false}
                    target="_blank"
                    href={linkHref(props.attachment.Name)}
                    title="Open"
                >
                    <Icon iconName="RedEye" />
                </Link>
                <Link
                    data-interception="off"
                    underline={false}
                    href={downloadLinkHref(props.attachment.Name)}
                    title="Download"
                >
                    <Icon iconName="Download" />
                </Link>
                <Link
                    onClick={async () => {
                        const alert = await getAlert({
                            title: 'Delete',
                            subText: `You are about to delete file '${props.attachment.Name}'. Are you sure?`,
                            buttons: [
                                { key: 'Yes', text: 'Yes', },
                                { key: 'No', text: 'No', },
                            ]
                        });
                        if (alert === 'Yes') {
                            await removeAttachment(props.task, props.attachment.Name);
                            props.setAttachments((prev) =>
                                prev.filter((pa) => pa.Name !== props.attachment.Name)
                            );
                        }
                    }}
                    title="Delete"
                >
                    <Icon iconName="Delete" />
                </Link>
            </div>
        </div>
    )
}

export const Attachments: React.FC<IAttachmentsProps> = (props) => {
    const { theme } = React.useContext(GlobalContext);
    const [attachments, setAttachments] = React.useState([]);
    const {
        addAttachments,
        getAttachments,
    } = useAttachments();

    React.useEffect(() => {
        getAttachments(props.task).then((r) => setAttachments(r));
    }, []);

    return (
        <>
            <Label className={styles.attachments__label}>Files</Label>
            <div
                style={{
                    backgroundColor: theme.palette.themeLighterAlt,
                    padding: '.5em',
                }}
            >
                <div className={styles.attachments} style={{ borderColor: theme.palette.themeLight }} >
                    {attachments.map((a) => (<Attachment key={a.Name} attachment={a} task={props.task} setAttachments={setAttachments} />))}
                </div>
                <FileInput
                    multiple
                    onFilesAdded={async (files) => {
                        await addAttachments(props.task, files);
                        setAttachments(await getAttachments(props.task));
                    }}
                />
            </div>
        </>
    );
};
