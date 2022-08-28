import { Dropdown, IDropdownOption } from 'office-ui-fabric-react';
import * as React from 'react';

export interface ITeamSelectorProps {
    teams: string[];
    selectedTeam: string;
    onTeamSelect: (team: string) => void;
}

export const TeamSelector: React.FC<ITeamSelectorProps> = (props) => {
    const options: IDropdownOption[] = React.useMemo(() => {
        return props.teams.map((team) => ({
            key: team,
            text: team,
        }))
    }, []);

    return (
        <Dropdown
            disabled={props.teams.length <= 1}
            options={options}
            selectedKey={props.selectedTeam}
            onChange={(ev, option) => props.onTeamSelect(option.text)}
            styles={{
                root: {
                    minWidth: 100
                }
            }}
        />
    );
};
