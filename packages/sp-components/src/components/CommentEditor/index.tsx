import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Mention } from '@tiptap/extension-mention';
import { ICommentInfo, ISiteUserInfo } from 'sp-preset';
import Suggestion from './suggestion';
import StarterKit from '@tiptap/starter-kit';
import { IconButton } from 'office-ui-fabric-react';
import styles from './CommentEditor.module.scss';
import { Callout } from '../Callout';

export interface IComment {
    mentions: ICommentInfo['mentions'];
    text: string;
}

export interface ICommentEditorProps {
    users: ISiteUserInfo[];
    onAddComment: (comment: IComment) => void;
    clearAfterInsert?: boolean;
    initialContent?: string;
}

export const CALLOUT_ID = 'spfx/Suggestion';

function reAddNewLines(text: string) {
    if (text === '') return text;
    const lines = text.split('\n');
    if (lines.length === 1) return text;
    return lines.map((l) => `<p>${l}</p>`).join('\n');
}

function removeDoubleNewLines(text: string) {
    return text.replace(/\n{2,3}/g, '\n');
}

export function getMentionsFromHtml(
    html: string,
    users: ISiteUserInfo[]
): ICommentInfo['mentions'] {
    const d = document.createElement('div');
    d.innerHTML = html;
    const mentionStrings = Array.from(
        d.querySelectorAll(`.${styles.mention}`)
    ).map((m) => m.textContent.replace('@', ''));
    const mentions = users.filter((u) => mentionStrings.indexOf(u.Title) > -1);
    return mentions.map((m) => ({
        loginName: m.Email,
        email: m.Email,
        name: m.Title,
    })) as ICommentInfo['mentions'];
}

export const CommentEditor: React.FC<ICommentEditorProps> = ({ initialContent = '', clearAfterInsert = true, ...props }) => {
    const editorRef = React.useRef(null);
    const [comment, setComment] = React.useState<IComment>({
        text: '',
        mentions: null,
    });
    const [empty, setEmpty] = React.useState(initialContent === '');
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
                    hardBreak: false,
                    heading: false,
                    horizontalRule: false,
                    italic: false,
                    strike: false,
                    bulletList: false,
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
            content: reAddNewLines(initialContent),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onUpdate: (innerProps) => {
                const text = removeDoubleNewLines(innerProps.editor.view.dom.innerText);
                setEmpty(text.trim() === '');
                setComment(() => ({
                    text,
                    mentions: getMentionsFromHtml(
                        innerProps.editor.getHTML(),
                        props.users
                    ),
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
                            if (!empty) {
                                props.onAddComment(comment);
                                if (clearAfterInsert) {
                                    editor.commands.clearContent();
                                    setEmpty(true);
                                }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};
