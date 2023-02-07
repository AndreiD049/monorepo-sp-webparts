import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Mention } from '@tiptap/extension-mention';
import { ISiteUserInfo } from 'sp-preset';
import Suggestion from './suggestion';
import { Callout } from 'sp-components';
import StarterKit from '@tiptap/starter-kit';
import { IconButton } from 'office-ui-fabric-react';
import styles from './CommentEditor.module.scss';

interface IComment {
    mentions: ISiteUserInfo[];
    text: string;
}

export interface ICommendEditorProps {
    users: ISiteUserInfo[];
    onAddComment: (comment: IComment) => void;
}

export const CALLOUT_ID = 'spfx/Suggestion';

export const CommentEditor: React.FC<ICommendEditorProps> = (props) => {
    const editorRef = React.useRef(null);
    const [comment, setComment] = React.useState<IComment>({
        text: '',
        mentions: [],
    });
    const [empty, setEmpty] = React.useState(true);
    const suggestion = React.useRef(Suggestion.setUsers(props.users));

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({
                    bold: false,
                    code: false,
                    codeBlock: false,
                    blockquote: false,
                    dropcursor: false,
                    gapcursor: false,
                    heading: false,
                    horizontalRule: false,
                    italic: false,
                    strike: false,
                    bulletList: false,
                    hardBreak: false,
                    listItem: false,
                    orderedList: false,
                }),
                Mention.configure({
                    HTMLAttributes: {
                        class: styles.mention,
                    },
                    renderLabel: (props) => {
                        return `${props.options.suggestion.char}${props.node.attrs.id.Title}`;
                    },
                    suggestion: suggestion.current,
                }),
            ],
            content: '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onUpdate: (innerProps) => {
                const d = document.createElement('div');
                d.innerHTML = innerProps.editor.getHTML();
                const mentionStrings = Array.from(
                    d.querySelectorAll(`.${styles.mention}`)
                ).map((m) => m.textContent.replace('@', ''));
                const mentions = props.users.filter(
                    (u) => mentionStrings.indexOf(u.Title) > -1
                );
                console.log(mentions);
                const text = innerProps.editor.getText();
                setEmpty(text === '');
                setComment((prev) => ({
                    text,
                    mentions,
                }));
            },
        },
        [props.users]
    );

    return (
        <div className={`${styles.container} ${empty ? styles.empty : ''}`}>
            <Callout id={CALLOUT_ID} />
            <EditorContent ref={editorRef} editor={editor} />
            {!empty && (
                <div className={styles.sendRow}>
                    <IconButton
                        title="Add comment"
                        iconProps={{ iconName: 'Send' }}
                        onClick={() => {
                            props.onAddComment(comment);
                            editor.commands.clearContent();
                            setEmpty(true);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
