/**
 * The sole purpose of this file is to lazily load the component.
 * User doesn't 
 */
import * as React from 'react';
import { ICommentEditorProps } from 'sp-components/dist/editor'

export const CommentEditor: React.FC<ICommentEditorProps> = (props) => {
    const [Editor, setEditor] = React.useState<React.FC<ICommentEditorProps>>(null);

    React.useEffect(() => {
        import(
          /* webpackChunkName: 'CommentEditor' */
          'sp-components/dist/editor'
        ).then((c) => setEditor(() => c.CommentEditor)).catch((err) => console.error(`Error loading component ${err}`));
    }, []);

    if (Editor) {
        return <Editor {...props} />;
    }
    return null;
}