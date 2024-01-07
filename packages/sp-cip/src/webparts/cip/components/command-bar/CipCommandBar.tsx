import { debounce } from '@microsoft/sp-lodash-subset';
import {
    CommandBar,
    ICommandBarItemProps,
    SearchBox,
} from '@fluentui/react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { relinkParent, setTimerOptions } from '../../utils/dom-events';
import { GlobalContext } from '../../utils/GlobalContext';
import { AssigneeSelected, CipAssigneeSelector } from './CipAssigneeSelector';
import { CipCategoriesToggle } from './CipCategoriesToggle';
import { CipStatusSelector, StatusSelected } from './StatusSelector';
import { DIALOG_ID, TIMER_VISIBLE_KEY } from '../../utils/constants';
import useWebStorage from 'use-web-storage-api';
import { TeamSelector } from '../TeamSelector';
import { showDialog } from 'sp-components';
import { TimeLog } from '../TimeLog';

interface ICipCommandBarProps {
    onSearch: (val: string) => void;
    onTeamSelect: (team: string) => void;
    onStatusSelectedChange: (newStatus: StatusSelected) => void;
    onAssignedToChange: (newAssigned: AssigneeSelected) => void;
    onShowCategoriesToggle: (val: boolean) => void;
}

const CipCommandBar: React.FC<ICipCommandBarProps> = (props) => {
    const { teams, selectedTeam } = React.useContext(GlobalContext);
    const handleSearch = React.useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        debounce((_ev: any, value: string) => {
            props.onSearch(value);
            relinkParent('all');
        }, 1000),
        [props.onSearch]
    );
    const navigate = useNavigate();

    /** Timer */
    const [timerVisible, setTimerVisible] = useWebStorage<boolean>(true, {
        key: TIMER_VISIBLE_KEY,
    });

    React.useEffect(() => {
        setTimerOptions({ visible: timerVisible });
    }, [timerVisible]);

    const items: ICommandBarItemProps[] = React.useMemo(() => {
        const result = [
            {
                key: 'new',
                text: 'New task',
                iconProps: {
                    iconName: 'Add',
                },
                onClick: () => navigate('new'),
            },
            {
                key: 'log',
                text: 'Log time',
                iconProps: {
                    iconName: 'Clock',
                },
                onClick: () =>
                    showDialog({
                        id: DIALOG_ID,
                        dialogProps: {
                            title: 'Log time',
                        },
                        content: <TimeLog dialogId={DIALOG_ID} />,
                    }),
            },
            {
                key: 'timers',
                text: timerVisible ? 'Hide timers' : 'Show timers',
                iconProps: {
                    iconName: 'Timer',
                },
                onClick: () => {
                    setTimerVisible((prev) => !prev);
                },
            },
            {
                key: 'actionLog',
                text: 'Action log',
                iconProps: {
                    iconName: 'BacklogList',
                },
                onClick: () => navigate('actionlog'),
            },
        ];
        return result;
    }, [timerVisible]);

    return (
        <>
            <CommandBar
                items={items}
                farItems={[
                    {
                        key: 'toggle_category',
                        onRender: () => (
                            <CipCategoriesToggle
                                onShowCategoriesToggle={
                                    props.onShowCategoriesToggle
                                }
                            />
                        ),
                    },
                    {
                        key: 'team',
                        onRender: () => (
                            <TeamSelector
                                style={{
                                    alignSelf: 'center',
                                    marginRight: '.5em',
                                    minWidth: 70,
                                }}
                                items={['All', ...teams]}
                                selectedTeam={selectedTeam}
                                getTeamText={(team) => team}
                                getTeamId={(team) => team}
                                onTeamChange={props.onTeamSelect}
                            />
                        ),
                    },
                    {
                        key: 'status',
                        onRender: () => (
                            <CipStatusSelector
                                onSelectedChange={props.onStatusSelectedChange}
                            />
                        ),
                    },
                    {
                        key: 'asignee',
                        onRender: () => (
                            <CipAssigneeSelector
                                onAssignedToChange={props.onAssignedToChange}
                            />
                        ),
                    },
                    {
                        key: 'search',
                        onRender: () => (
                            <SearchBox
                                styles={{ root: { alignSelf: 'center' } }}
                                autoComplete="off"
                                onChange={handleSearch}
                                id="sp-cip-quick-search"
                                placeholder="Quick search..."
                            />
                        ),
                    },
                ]}
            />
        </>
    );
};

export default CipCommandBar;
