import { IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { SECTION_EVENT } from '../../constants';
import ISection from '../../models/ISection';
import styles from './Section.module.scss';

export interface ISectionProps extends React.HTMLAttributes<HTMLDivElement> {
    section: ISection;
    editable?: boolean;
}

type SectionActions = 'REFRESH';

interface ISectionActionHandlers {
    open: () => void;
    refresh: () => void | undefined;
}
interface ISectionEventDetails {
    sectionName: string;
    action: SectionActions;
}

export const dispatchSectionHandler = (
    sectionName: string,
    action: SectionActions,
): void => {
    document.dispatchEvent(
        new CustomEvent<ISectionEventDetails>(SECTION_EVENT, {
            detail: {
                sectionName,
                action,
            },
        })
    );
};

export const listenSectionEvent = (sectionName: string, action: SectionActions, handler: () => void): (ev: {}) => void => {
    const resultHandler = (ev: CustomEvent<ISectionEventDetails>): void => {
        if (ev.detail.sectionName === sectionName && ev.detail.action === action) {
            handler();
        }
    }
    document.addEventListener(SECTION_EVENT, resultHandler);
    return resultHandler;
}

const SectionHeader: React.FC<{
    section: ISection;
}> = ({ section }) => {
    if (!section.header) return null;
    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                {/* Near items */}
                <div>
                    <Text variant="mediumPlus">{section.name}</Text>
                </div>
                {/* Far items */}
                <div>
                    <IconButton onClick={() => dispatchSectionHandler(section.name, 'REFRESH')} iconProps={{ iconName: 'Refresh' }} />
                    <IconButton
                        className={styles.openNewTabButton}
                        iconProps={{ iconName: 'OpenInNewTab' }}
                    />
                </div>
            </div>
        </div>
    );
};

export const Section: React.FC<ISectionProps> = React.forwardRef(
    ({ style, className, ...props }, ref: React.RefObject<HTMLDivElement>) => {
        const classes = [className, styles.container];
        if (props.editable) {
            classes.push(styles.editable);
        }

        return (
            <div className={classes.join(' ')} {...props} style={{ ...style }} ref={ref}>
                <SectionHeader section={props.section} />
                <div
                    className={styles.content}
                    style={{ height: props.section.header ? 'calc(100% - 44px)' : '100%' }}
                >
                    {props.children}
                </div>
            </div>
        );
    }
);
