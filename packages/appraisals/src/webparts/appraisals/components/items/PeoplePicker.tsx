import {
    IPersonaProps,
    ListPeoplePicker,
    PersonaSize,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { IUser } from '../../dal/IUser';
import styles from './AppraisalItems.module.scss';

export interface IPeoplePickerProps {
    people: IUser[];
    selected: IUser;
    setSelected: (user: IUser) => void;
}

export interface IPersonaPropsWithData extends IPersonaProps {
    user: IUser;
}

const PeoplePicker: React.FC<IPeoplePickerProps> = (props) => {
    const options: IPersonaPropsWithData[] = React.useMemo(() => {
        return props.people.map(
            (person: IUser): IPersonaPropsWithData => ({
                text: person.Title,
                size: PersonaSize.size32,
                user: person,
                imageUrl: `/_layouts/15/userphoto.aspx?size=S&username=${person.Email}`,
            })
        );
    }, [props.people]);

    const selected = React.useMemo<IPersonaPropsWithData[]>(() => {
        if (!props.selected) return [];
        return [
            {
                user: props.selected,
                text: props.selected.Title,
                size: PersonaSize.size32,
                imageUrl: `/_layouts/15/userphoto.aspx?size=S&username=${props.selected.Email}`,
            },
        ];
    }, [props.selected]);

    if (!props.people || props.people.length === 0) return null;
    return (
        <div className={styles.peoplePicker}>
            <ListPeoplePicker
                selectedItems={selected}
                onItemSelected={(sel: IPersonaPropsWithData) => {
                    props.setSelected(sel.user);
                    return sel;
                }}
                onResolveSuggestions={(filter: string) =>
                    options.filter(
                        (opt: IPersonaPropsWithData) =>
                            opt.text.indexOf(filter) !== -1 &&
                            opt.user.Id !== props.selected.Id
                    )
                }
                onEmptyInputFocus={() =>
                    options.filter((opt) => opt.user.Id !== props.selected.Id)
                }
            />
        </div>
    );
};

export default PeoplePicker;
