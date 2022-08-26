import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { CopyOnClickText } from '../CopyOnClickText';
import styles from './TaskBody.module.scss';

export interface ITaskBodyProps {
    remark?: string;
    description?: string;
}

const COPY_RE = /\[\[([^\]]+)\]\]/g;

// Text surrounded by [[ ]] should become clickable
// When user clicks it, it copies the text to clipboard
const parseText = (text: string): JSX.Element => {
    const tokens = Array.from(text.matchAll(COPY_RE));
    // If no tokens, return text as is
    const result = [];
    let startPivot = 0;
    tokens.forEach((token) => {
        // Everything from startPivot to token is simple text
        result.push(<>{text.slice(startPivot, token.index)}</>)
        // token becomes copy on click
        result.push(<CopyOnClickText variant='smallPlus'>{token[1]}</CopyOnClickText>)
        startPivot = token.index + token[0].length;
    })
    // If there is any text left after startPivot, just include it as simple text
    if (startPivot < text.length) {
        result.push(<>{text.slice(startPivot)}</>);
    }
    return (<Text variant='smallPlus' className={styles.description}>{result.map((e) => e)}</Text>)
}

export const TaskBody: React.FC<ITaskBodyProps> = (props) => {
    return (
            <>
                {props.remark && (
                    <>
                        <Text className={styles.label} variant="smallPlus">
                            Remark:
                        </Text>
                        {parseText(props.remark)}
                    </>
                )}
                {props.description && (
                    <>
                        <Text className={styles.label} variant="smallPlus">
                            Description:
                        </Text>
                        {parseText(props.description)}
                    </>
                )}
            </>
    );
};
