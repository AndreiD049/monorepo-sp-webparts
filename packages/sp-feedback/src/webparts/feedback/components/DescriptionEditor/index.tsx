import Image from '@tiptap/extension-image';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import * as React from 'react';
import styles from './DescriptionEditor.module.scss';
import {
    ActionButton,
    ChoiceGroup,
    IChoiceGroupOption,
    TextField,
} from 'office-ui-fabric-react';
import { Dialog, FooterOkCancel, hideDialog, showDialog } from 'sp-components';

const DIALOG_ID = 'spfxFeedbackDialog';
export interface IDescriptionEditorProps {
    id?: string;
    onUpdate?: (content: string) => void;
    onBlur?: (content: string) => void;
    content: string;
    editable?: boolean;
}

async function getBase64DataFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = function (e) {
                resolve(e.target.result as string);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            reject(err);
        }
    });
}

const ImageDialog: React.FC<{ editor: Editor }> = (props) => {
    const [selected, setSelected] = React.useState<'Attach' | 'Url'>('Attach');
    const [file, setFile] = React.useState<File>(null);
    const [url, setUrl] = React.useState('');
    const groupOptions: IChoiceGroupOption[] = [
        {
            key: 'Attach',
            iconProps: {
                iconName: 'Attach',
            },
            imageSize: {
                height: 40,
                width: 40,
            },
            text: 'Attach',
        },
        {
            key: 'Url',
            iconProps: {
                iconName: 'Link',
            },
            imageSize: {
                height: 40,
                width: 40,
            },
            text: 'Url',
        },
    ];
    return (
        <div>
            <ChoiceGroup
                options={groupOptions}
                selectedKey={selected}
                onChange={(_ev, option) =>
                    setSelected(option.key as 'Attach' | 'Url')
                }
            />
            <div style={{ marginTop: 4 }}>
                {selected === 'Attach' ? (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(ev) => {
                            const files = ev.target.files;
                            if (files.length > 0) {
                                setFile(files[0]);
                            } else {
                                setFile(null);
                            }
                        }}
                    />
                ) : (
                    <TextField
                        placeholder="Url"
                        value={url}
                        onChange={(_ev, value) => setUrl(value)}
                    />
                )}
            </div>
            <div style={{ marginTop: 8 }}>
                <FooterOkCancel
                    onOk={async () => {
                        if (selected === 'Attach' && file) {
                            props.editor.commands.setImage({
                                src: await getBase64DataFromFile(file),
                            });
                        } else {
                            props.editor.commands.setImage({
                                src: url,
                            });
                        }
                        hideDialog(DIALOG_ID);
                    }}
                    onCancel={() => hideDialog(DIALOG_ID)}
                />
            </div>
        </div>
    );
};

const HeaderButton: React.FC<{
    iconName: string;
    onClick: () => void;
    disabled?: boolean;
    editor: Editor;
    name?: string;
    attributes?: {};
    title: string;
}> = (props) => {
    return (
        <ActionButton
            onClick={props.onClick}
            disabled={props.disabled}
            className={`${styles.headerButton} ${
                props.name &&
                (props.editor.isActive(props.name, props.attributes)
                    ? styles.headerButtonActive
                    : '')
            }`}
            tabIndex={-1}
            title={props.title}
            iconProps={{ iconName: props.iconName }}
        />
    );
};

const MenuBar: React.FC<{ editor: Editor }> = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className={styles.header}>
            <HeaderButton
                iconName="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                editor={editor}
                name="bold"
                title="Bold"
            />
            <HeaderButton
                iconName="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                editor={editor}
                name="italic"
                title="Italic"
            />
            <HeaderButton
                iconName="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                editor={editor}
                name="strike"
                title="Strikethrough"
            />
            <HeaderButton
                iconName="Header1"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                disabled={
                    !editor
                        .can()
                        .chain()
                        .focus()
                        .toggleHeading({ level: 1 })
                        .run()
                }
                editor={editor}
                name="heading"
                attributes={{ level: 1 }}
                title="Heading level 1"
            />
            <HeaderButton
                iconName="Header2"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                disabled={
                    !editor
                        .can()
                        .chain()
                        .focus()
                        .toggleHeading({ level: 2 })
                        .run()
                }
                editor={editor}
                name="heading"
                attributes={{ level: 2 }}
                title="Heading level 2"
            />
            <HeaderButton
                iconName="Header3"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                disabled={
                    !editor
                        .can()
                        .chain()
                        .focus()
                        .toggleHeading({ level: 3 })
                        .run()
                }
                editor={editor}
                name="heading"
                attributes={{ level: 3 }}
                title="Heading level 3"
            />
            <HeaderButton
                iconName="Header4"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
                disabled={
                    !editor
                        .can()
                        .chain()
                        .focus()
                        .toggleHeading({ level: 4 })
                        .run()
                }
                editor={editor}
                name="heading"
                attributes={{ level: 4 }}
                title="Heading level 4"
            />
            <HeaderButton
                iconName="NumberedList"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={
                    !editor.can().chain().focus().toggleOrderedList().run()
                }
                editor={editor}
                name="orderedList"
                title="Ordered list"
            />
            <HeaderButton
                iconName="BulletedList"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={
                    !editor.can().chain().focus().toggleBulletList().run()
                }
                editor={editor}
                name="bulletList"
                title="Bullet list"
            />
            <HeaderButton
                iconName="RightDoubleQuote"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                disabled={
                    !editor.can().chain().focus().toggleBlockquote().run()
                }
                editor={editor}
                name="blockquote"
                title="Blockquote"
            />
            <HeaderButton
                iconName="CodeEdit"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
                editor={editor}
                name="codeblock"
                title="Code block"
            />
            <HeaderButton
                iconName="FileImage"
                onClick={() =>
                    showDialog({
                        id: DIALOG_ID,
                        dialogProps: {
                            dialogContentProps: {
                                title: 'Add image',
                            },
                        },
                        content: <ImageDialog editor={editor} />,
                    })
                }
                editor={editor}
                title="Add image"
            />
        </div>
    );
};

export const DescriptionEditor: React.FC<IDescriptionEditorProps> = ({
    editable = true,
    id,
    ...props
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: true,
                linkOnPaste: true,
                HTMLAttributes: {
                    rel: 'noreferrer,noopener',
                    target: '_blank',
                },
            }),
        ],
        onUpdate: (innerProps) =>
            props.onUpdate ? props.onUpdate(innerProps.editor.getHTML()) : null,
        onBlur: (innerProps) => 
            props.onBlur ? props.onBlur(innerProps.editor.getHTML()) : null,
        content: props.content,
        editable,
    });

    return (
            <div className={styles.container}>
                {editable && <MenuBar editor={editor} />}
                <EditorContent id={id} editor={editor} />
                <Dialog id={DIALOG_ID} />
            </div>
    );
};
