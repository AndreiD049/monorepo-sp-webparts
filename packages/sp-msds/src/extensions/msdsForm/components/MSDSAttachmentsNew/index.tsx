import {
    Icon,
    Label,
    PrimaryButton,
    Stack,
    Text,
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

export const MSDSAttachmentsNew: React.FC<IMSDSAttachmentsProps> = (props) => {
    const input = React.useRef(null);

    return (
        <div className={styles.container}>
            <Label htmlFor={props.id} required={Boolean(props.rules?.required)} title={props.title}>
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
                                onChange={async (ev) => {
                                    const files = Array.from(ev.target.files);
                                    field.onChange(files);
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
                                    <Text variant="smallPlus">
                                        {field.value?.length} file(s) selected
                                    </Text>
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
