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
    return (
        <div className={styles.header}>
            <div className={styles.headerContent}>
                {/* Near items */}
                <div>
                    <Text variant="mediumPlus">{section.name}</Text>
                </div>
                {/* Far items */}
                <div>
                    <IconButton
                        onClick={() => dispatchSectionHandler(section.name, 'REFRESH')}
                        iconProps={{ iconName: 'Refresh' }}
                    />
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
