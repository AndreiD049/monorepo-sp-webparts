import * as React from 'react';
import styles from './Section.module.scss';

export interface ISectionProps extends React.HTMLAttributes<HTMLDivElement> {
    editable?: boolean;
}

export const Section: React.FC<ISectionProps> = React.forwardRef(({ style, className, ...props}, ref: React.RefObject<HTMLDivElement>) => {

    const classes = [className];
    if (props.editable) {
        classes.push(styles.editable)
    }

    return (
        <div className={classes.join(' ')} {...props} style={{...style}} ref={ref}>
            {props.children}
        </div>
    );
});
