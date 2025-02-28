import { Icon } from '@fluentui/react';
import * as React from 'react';
import styles from './Collapsible.module.scss';

export interface ICollapsibleProps extends React.HTMLAttributes<HTMLElement> {
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
    initialCollapsed?: boolean;
    onRenderHeader?: (collapsed: boolean) => JSX.Element;
    header: string;
}

export const Collapsible: React.FC<ICollapsibleProps> = (props) => {
    const initial = props.collapsed || props.initialCollapsed || true;
    const [collapsed, setCollapsed] = React.useState<boolean>(initial);

    const handleClicked = (): void => {
        setCollapsed((prev) => {
            const result = !prev;
            if (props.onCollapse) {
                props.onCollapse(result);
            }
            return result;
        });
    };

    const icon = React.useMemo(() => {
        const name = collapsed ? 'ChevronRight' : 'ChevronDown';
        return <Icon iconName={name} />;
    }, [collapsed]);

    const header = React.useMemo(() => {
        if (props.onRenderHeader) {
            return props.onRenderHeader(collapsed);
        }
        return <span>{props.header}</span>;
    }, [collapsed]);

	let headerClassName = 'header'
	if (!collapsed) {
		headerClassName += ' header-expanded'
	}

    return (
        <div style={props.style} className={props.className}>
            <div
                style={{
                    cursor: 'pointer',
                    userSelect: 'none',
					display: 'flex',
					flexFlow: 'row nowrap',
					alignItems: 'center'
                }}
                className={`${styles.container} ${headerClassName}`}
                onClick={handleClicked}
            >
                {icon}
                {header}
            </div>
            {!collapsed ? props.children : null}
        </div>
    );
};
