import * as React from 'react';
import { Dropdown } from 'office-ui-fabric-react';
import styles from './TeamSelector.module.scss';

export interface ITeamSelectorProps<T>
    extends React.HTMLAttributes<HTMLElement> {
    items: T[];
    selectedTeam: T;
    getTeamText: (item: T) => string;
    getTeamId: (item: T) => string | number;
    onTeamChange: (item: string | number) => void;
}

export function TeamSelector<T>({
    style,
    className,
    ...props
}: ITeamSelectorProps<T>) {
    const options = React.useMemo(() => {
        return props.items.map((i) => ({
            key: props.getTeamId(i),
            text: props.getTeamText(i),
        }));
    }, [props.items]);
    return (
        <div style={style}>
            <Dropdown
                defaultSelectedKey={props.getTeamId(props.selectedTeam)}
                dropdownWidth="auto"
                options={options}
                onChange={(_ev, team) => props.onTeamChange(team.key)}
            />
        </div>
    );
}
