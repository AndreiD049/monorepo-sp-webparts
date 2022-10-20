import * as React from 'react';
import { RELINK_EVT } from '../../constants';


/**
 *  Hook used to re-draw the stroke
 *  that goes from subtask to it's parent
 *  triggered when a task it's expanded to show the subtasks
 *  and also when the subtasks are finished loading and
 *  shimmers are replaced by actual tasks
 */ 
export const useRelink = (mainTaskId: number): [boolean, () => void] => {
    const evtName = `${RELINK_EVT}/${mainTaskId}`;
    const [relink, setRelink] = React.useState<boolean>(false);

    const relinkAllUnderMain = React.useCallback(() => {
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent(evtName));
        }, 0);
    }, []);

    React.useEffect(() => {
        function handler(evt: CustomEvent): void {
            setRelink((prev) => !prev);
        }
        document.addEventListener(evtName, handler);
        return () => document.removeEventListener(evtName, handler);
    }, []);

    return [relink, relinkAllUnderMain];
};
