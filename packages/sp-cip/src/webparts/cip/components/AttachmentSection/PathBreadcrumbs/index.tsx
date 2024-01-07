import { Text } from '@fluentui/react';
import * as React from 'react';
import styles from './PathBreadcrumbs.module.scss';

export interface IPathBreadcrumbsProps {
    path: string[];
    setPath: React.Dispatch<React.SetStateAction<string[]>>;
}

interface IBreadcrumbProps {
    name: string;
    isLast: boolean;
    onChange: () => void;
}

const Breadcrumb: React.FC<IBreadcrumbProps> = ({ name, isLast, onChange }) => {
    const classNames = React.useMemo(() => {
        let result = styles.breadcrumb;
        if (!isLast) {
            result += ` ${styles.breadcrumbClickable}`;
        }
        return result;
    }, [isLast])

    const handleClick = React.useCallback(() => {
        if (isLast) return;
        onChange();
    }, [isLast, onChange]);

    return (
        <>
            <Text variant='smallPlus' className={classNames} onClick={handleClick}>{name}</Text>
            {!isLast && (<span> / </span>)}
        </>
    )
}

export const PathBreadcrumbs: React.FC<IPathBreadcrumbsProps> = (props) => {

    const handleChange = React.useCallback((idx: number) => {
        return () => {
            props.setPath((prev) => prev.slice(0, idx));
        }
    }, [props]);

    return (
        <div className={styles.container}>
            <Breadcrumb name="Root" isLast={props.path.length === 0} onChange={handleChange(0)} />
            {props.path.map((name, idx) => (
                <Breadcrumb key={name} name={name} isLast={idx === props.path.length - 1} onChange={handleChange(idx + 1)} />
            ))}
        </div>
    );
};
