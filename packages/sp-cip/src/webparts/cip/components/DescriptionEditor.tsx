import { ActionButton, Link, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './Cip.module.scss';
import { FileInput } from './Utils/FileInput';

export interface IDescriptionEditorProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    value: string;
    onChange?: (value: string) => void;
    onFilesAdded?: (file: File[]) => void;
    onSave?: () => void;
}

export const DescriptionEditor: React.FC<IDescriptionEditorProps> = (props) => {
    const [readonly, setReadonly] = React.useState(true);

    const actionButton = React.useMemo(() => {
        const label = readonly ? 'Edit' : 'Save';
        const handleClick = readonly
            ? () => setReadonly(false)
            : () => {
                  props.onSave();
                  setReadonly(true);
              };
        return (
            <ActionButton
                iconProps={{
                    iconName: 'Edit',
                    styles: {
                        root: {
                            fontSize: '.85em',
                        },
                    },
                }}
                styles={{
                    root: {
                        height: '2em',
                        padding: 0,
                        fontSize: '.85em',
                    },
                    label: {
                        marginLeft: 2,
                    },
                }}
                onClick={handleClick}
            >
                {label}
            </ActionButton>
        );
    }, [readonly, props.onSave]);

    return (
        <div className={`${styles['description-editor']} ${props.className}`} style={{...props.style}}>
            <div className={styles['description-editor__buttons']}>{actionButton}</div>
            <TextField
                multiline
                value={props.value}
                resizable={false}
                autoAdjustHeight
                readOnly={readonly}
                onChange={(ev, val) => props.onChange && props.onChange(val)}
                styles={{
                    root: {
                        borderLeft: '1px dashed',
                        borderRight: '1px dashed',
                        borderColor: 'inherit'
                    },
                    fieldGroup: {
                        border: 0,
                        borderColor: 'transparent',
                        backgroundColor: readonly ? 'transparent' : 'none',
                    },
                }}
            />
            <span className={styles['description-editor__file-input']}>
                <FileInput multiple onFilesAdded={(files) => props.onFilesAdded && props.onFilesAdded(files)} />
            </span>
        </div>
    );
};
