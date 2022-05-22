import { reduceRight } from "lodash";
import { Icon, Text } from "office-ui-fabric-react";
import * as React from "react";
import styles from '../Cip.module.scss';

export interface IFileInputProps extends React.HTMLAttributes<HTMLElement> {
    multiple?: boolean;
    onFilesAdded?: (files: File[]) => void;
}

export const FileInput: React.FC<IFileInputProps> = (props) => {
    const [files, setFiles] = React.useState<File[]>([]);
    const [dragOver, setDragover] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function ondrag() {
            setDragover(true)
        }
        function ondragend() {
            setDragover(false)
        }
        if (ref.current) {
            ref.current.addEventListener('dragover', ondrag);
            ref.current.addEventListener('dragleave', ondragend);
            ref.current.addEventListener('drop', ondragend);
            return () => {
                ref.current.removeEventListener('dragover', ondrag);
                ref.current.removeEventListener('dragleave', ondragend);
                ref.current.removeEventListener('drop', ondragend);
            }
        }
    }, []);

    const handleChange = React.useCallback(async (evt: React.ChangeEvent<HTMLInputElement>) => {
        const input = evt.target;
        const files = [];
        for (let i = 0; i < input.files.length; i++) {
            files.push(input.files.item(i));
        }
        setFiles(files);
        props.onFilesAdded && await props.onFilesAdded(files);
        setFiles([]);
    }, []);

    const fileNames = React.useMemo(() => {
        return files.map((file) => file.name);
    }, [files]);

    const label = React.useMemo(() => {
        if (fileNames.length) {
            return <Text variant='smallPlus'><Icon iconName='AlarmClock' /> Uploading files. Please wait...</Text>
        }
        if (dragOver) {
            return <Text variant='smallPlus'><Icon iconName='Attach' /> Upload files...</Text>
        } else {
            return <Text variant='smallPlus'><Icon iconName='Attach' /> Click or drop files to attach...</Text>
        }
    }, [fileNames, dragOver]);

    const defaultClass = React.useMemo(() => {
        return `${styles['file-input']} ${dragOver ? styles['file-input__input_dragover'] : ''} ${props.className || ''}`;
    }, [dragOver, props])

    return (
        <div ref={ref} className={defaultClass}>
            {props.children}
            <input onChange={handleChange} className={styles['file-input__input']} type="file" multiple={props.multiple || false} />
            {label}
        </div>
    );
};