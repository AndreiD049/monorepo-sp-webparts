import { reduceRight } from "lodash";
import * as React from "react";
import styles from '../Cip.module.scss';

export interface IFileInputProps {
    multiple?: boolean;
    label?: string;
    onFilesAdded?: (files: File[]) => void;
}

export const FileInput: React.FC<IFileInputProps> = (props) => {
    const [files, setFiles] = React.useState<File[]>([]);
    const [noFilesLabel, setNoFilesLabel] = React.useState(null);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function ondrag() {
            setNoFilesLabel('Upload files...')
        }
        function ondragend() {
            setNoFilesLabel(null)
        }
        if (ref.current) {
            ref.current.addEventListener('dragenter', ondrag);
            ref.current.addEventListener('dragleave', ondragend);
            ref.current.addEventListener('drop', ondragend);
            return () => {
                ref.current.removeEventListener('dragenter', ondrag);
                ref.current.removeEventListener('dragleave', ondragend);
                ref.current.removeEventListener('drop', ondragend);
            }
        }
    }, []);

    const handleChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        const input = evt.target;
        const files = [];
        for (let i = 0; i < input.files.length; i++) {
            files.push(input.files.item(i));
        }
        setFiles(files);
        props.onFilesAdded && props.onFilesAdded(files);
    }, []);

    const fileNames = React.useMemo(() => {
        return files.map((file) => file.name);
    }, [files]);

    const label = React.useMemo(() => {
        if (props.label) {
            return <span className={styles['file-input__label']}>{props.label}</span>
        }
        if (noFilesLabel) {
            return <span className={styles['file-input__label']}>{noFilesLabel}</span>
        }
        if (fileNames.length) {
                return <span className={styles['file-input__label']}>{fileNames.join(', ')}</span>
        } else {
            return <span className={styles['file-input__label']}>Drop or click to attach files...</span>
        }
    }, [fileNames, noFilesLabel, props.label]);

    return (
        <div ref={ref} className={styles['file-input']}>
            <input onChange={handleChange} className={styles['file-input__input']} type="file" multiple={props.multiple || false} />
            {label}
        </div>
    );
};