import { uniqBy } from '@microsoft/sp-lodash-subset';
import {
    Icon,
    IconButton,
    Label,
    PrimaryButton,
    Stack,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import { MSDSFormProps } from '../MSDSTextField';
import { TextError } from '../TextError';
import styles from './MSDSAttachmentsNew.module.scss';

export interface IMSDSAttachmentsProps extends MSDSFormProps {
    id: keyof (IMSDSRequest & { Attachments: File[] });
    label: string;
    title?: string;
    style?: React.CSSProperties;
}

export function mergeFiles(files1: File[], files2: File[]): File[] {
    if (!files1) return files2;
    if (!files2) return files1;
    return uniqBy([...files1, ...files2], (f) => f.name);
}

export function removeFile(files: File[], fileToRemove: string): File[] {
    if (!files) return [];
    return files.filter((f) => f.name !== fileToRemove);
}

export const MSDSAttachmentsNew: React.FC<IMSDSAttachmentsProps> = (props) => {
    const input = React.useRef(null);

    return (
        <div className={styles.container}>
            <Label
                htmlFor={props.id}
                required={Boolean(props.rules?.required)}
                title={props.title}
            >
                <Icon iconName="TextField" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <Controller
                name={props.id}
                control={props.control}
                rules={props.rules}
                render={({ field, fieldState }) => {
                    return (
                        <>
                            <input
                                id={props.id}
                                type="file"
                                multiple
                                ref={input}
                                value={''}
                                onChange={async (ev) => {
                                    const files = Array.from(ev.target.files);
                                    field.onChange(mergeFiles(field.value, files));
                                }}
                            />
                            <Stack
                                verticalAlign="start"
                                horizontalAlign="start"
                                tokens={{ childrenGap: '.3em' }}
                            >
                                <PrimaryButton
                                    iconProps={{ iconName: 'Attach' }}
                                    onClick={() => input.current.click()}
                                >
                                    Add attachments
                                </PrimaryButton>
                                {field.value?.length && (
                                    <div className={styles.fileList}>
                                        {field.value?.map((file: File) => (
                                            <span key={file.name}>
                                                {file.name}{' '}
                                                <IconButton
                                                    className={styles.fileDeleteButton}
                                                    iconProps={{
                                                        iconName: 'Delete',
                                                    }}
                                                    onClick={() => {
                                                        field.onChange((prev: File[]) => removeFile(prev, file.name));
                                                    }}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Stack>
                            <TextError
                                error={
                                    fieldState.error && fieldState.error.message
                                }
                            />
                        </>
                    );
                }}
            />
        </div>
    );
};
