import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as React from 'react';
import styles from './DescriptionEditor.module.scss';
import './editorStyles.scss';

export interface IDescriptionEditorProps {
    // Props go here
}

export const DescriptionEditor: React.FC<IDescriptionEditorProps> = (props) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                allowBase64: true,
            }),
        ],
        onUpdate: (props) => {
            console.log(props);
        },
        content: '<p>Hello World!</p>',
    });

    return (
        <div className={styles.container}>
            <EditorContent editor={editor} />
        </div>
    );
};
