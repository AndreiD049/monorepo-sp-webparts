import { ButtonType, Icon, Label, Link, Stack, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { FileInput } from '../components/utils/FileInput';
import { ITaskOverview } from '../tasks/ITaskOverview';
import { GlobalContext } from '../utils/GlobalContext';
import { IAttachment } from './IAttachment';
import { useAttachments } from './useAttachments';
import styles from './Attachments.module.scss';
import { getDialog } from '../components/AlertDialog';
import { useTasks } from '../tasks/useTasks';
import { taskUpdated } from '../utils/dom-events';

interface IAttachmentsProps extends React.HTMLAttributes<HTMLDivElement> {
    task?: ITaskOverview;
    onAttachments: (files: File[]) => void;
    label?: string;
}

const getFileIconName = (name: string) => {
    const tokens = name.split('.');
    const extension = tokens[tokens.length - 1].toLowerCase();
    switch (extension) {
        case 'xls':
        case 'xlsx':
        case 'xltx':
        case 'xlsm':
            return 'ExcelDocument'
        case 'docx':
        case 'doc':
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
    const { properties } = React.useContext(GlobalContext);
    const { attachmentsUpdated } = useTasks();
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
                    onClick={async (evt) => {
                        const alert = await getDialog({
                            alertId: "DETAILS_PANEL",
                            title: 'Delete',
                            subText: `You are about to delete file '${props.attachment.Name}'. Are you sure?`,
                            buttons: [
                                { key: 'Yes', text: 'Yes', },
                                { key: 'No', text: 'No', type: ButtonType.default },
                            ]
                        });
                        if (alert === 'Yes') {
                            await removeAttachment(props.task, props.attachment.Name);
                            const latest = await attachmentsUpdated(props.task.Id, -1);
                            taskUpdated(latest);
                            props.setAttachments((prev) =>
                                prev.filter((pa) => pa.Name !== props.attachment.Name)
                            );
                        }
                        return false;
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
    const { getAttachments } = useAttachments();

    React.useEffect(() => {
        if (props.task) {
            getAttachments(props.task).then((r) => setAttachments(r));
        }
    }, [props.task]);

    return (
        <div style={props.style} className={styles.attachments__container}>
            <Label className={styles.attachments__label}>{props.label || 'Files'}</Label>
            <div
                style={{
                    backgroundColor: theme.palette.themeLighterAlt,
                    padding: '.5em',
                    height: '100%',
                }}
            >
                <FileInput
                    multiple
                    onFilesAdded={async (files) => {
                        await props.onAttachments(files);
                        if (props.task) {
                            setAttachments(await getAttachments(props.task));
                        }
                    }}
                >
                    <div className={styles.attachments} style={{ borderColor: theme.palette.themeLight }} >
                        {attachments.map((a) => (<Attachment key={a.Name} attachment={a} task={props.task} setAttachments={setAttachments} />))}
                    </div>
                </FileInput>
            </div>
        </div>
    );
};
