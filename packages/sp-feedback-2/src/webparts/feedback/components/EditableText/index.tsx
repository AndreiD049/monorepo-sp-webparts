import { Icon } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './EditableText.module.scss';

export interface IEditableTextProps {
    handleUpdate: (val: string) => void;
    value?: string;
	readOnly?: boolean;
}

export const EditableText: React.FC<
    IEditableTextProps & React.HTMLAttributes<HTMLInputElement>
> = ({ readOnly = false, ...props }) => {
    const [originalVal, setOriginalVal] = React.useState<string>(
        props.value || ''
    );
    const [val, setVal] = React.useState<string>(props.value || '');

	const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
		const target = ev.target;
		setVal(target.value);
	}

	const handleSync = () => {
		if (val !== originalVal) {
			setOriginalVal(val);
			props.handleUpdate(val);
		}
	}

	const handleCopyToClipboard = async () => {
		await navigator.clipboard.writeText(val);
	}

    return (
        <div {...props} className={styles.container}>
            <input
                type="text"
                tabIndex={0}
                value={val}
                onChange={handleChange}
                onBlur={handleSync}
            />
            <button className={styles.copyButton} onClick={handleCopyToClipboard}>
                <Icon iconName="Copy" />
            </button>
        </div>
    );
};
