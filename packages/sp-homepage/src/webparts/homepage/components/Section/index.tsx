import { IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import ISection from '../../models/ISection';
import { dispatchSectionHandler } from './section-events';
import styles from './Section.module.scss';

export interface ISectionProps extends React.HTMLAttributes<HTMLDivElement> {
    section: ISection;
    editable?: boolean;
}

const SectionHeader: React.FC<{
    section: ISection;
}> = ({ section }) => {
    if (!section.header) return null;

    const controls = React.useMemo(() => {
        const controls: JSX.Element[] = [];
        if (!section.headerControls || section.headerControls.length === 0) return controls;
        const lowerButtonsSet = new Set(section.headerControls.map((b) => b.toLowerCase()));
        if (lowerButtonsSet.has('refresh')) {
            controls.push(
                <IconButton
                    onClick={() => dispatchSectionHandler(section.name, 'REFRESH')}
                    className={styles.openNewTabButton}
                    iconProps={{ iconName: 'Refresh' }}
                />
            );
        }
        if (lowerButtonsSet.has('goto')) {
            controls.push(
                <IconButton
                    onClick={() => {
                        if (section.sources.length > 0 && section.sources[0].pageUrl) {
                            return window.open(section.sources[0].pageUrl, '_blank', 'noreferrer');
                        }
                        return null;
                    }}
                    className={styles.openNewTabButton}
                    iconProps={{ iconName: 'OpenInNewTab' }}
                />
            );
        }
        return controls;
    }, [section.headerControls]);

    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                {/* Near items */}
                <div>
                    <Text variant="mediumPlus">{section.name}</Text>
                </div>
                {/* Far items */}
                <div>
                    {controls}
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
