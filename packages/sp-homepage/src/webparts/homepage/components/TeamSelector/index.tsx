import { Dropdown, Icon, IDropdown, IDropdownOption } from 'office-ui-fabric-react';
import * as React from 'react';

export interface ITeamSelectorProps {
    teams: string[];
    selectedTeam: string;
    onTeamSelect: (team: string) => void;
}

export const TeamSelector: React.FC<ITeamSelectorProps> = (props) => {
    const dropdownRef = React.useRef<IDropdown>(null);
    const options: IDropdownOption[] = React.useMemo(() => {
        return props.teams.map((team) => ({
            key: team,
            text: team,
        }));
    }, []);

    return (
        <span
            style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Icon
                styles={{
                    root: {
                        fontSize: '1.5em',
                        marginRight: '.2em',
                        cursor: 'pointer',
                    },
                }}
                onClick={() => dropdownRef.current.focus(true)}
                iconName="Teamwork"
            />
            <Dropdown
                componentRef={dropdownRef}
                id="sp-homepage-team-selector"
                disabled={props.teams.length <= 1}
                options={options}
                selectedKey={props.selectedTeam}
                onChange={(_ev, option) => {
                    if (option.key !== props.selectedTeam) {
                        props.onTeamSelect(option.text);
                    }
                }}
                styles={{
                    root: {
                        minWidth: 100,
                    },
                }}
            />
        </span>
    );
};
