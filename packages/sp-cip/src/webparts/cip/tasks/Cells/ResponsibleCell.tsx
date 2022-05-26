import { update } from '@microsoft/sp-lodash-subset';
import {
    IPersonaProps,
    Persona,
    PersonaSize,
    SearchBox,
    Separator,
    Text,
    updateT,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useUsers } from '../../users/useUsers';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

function filterUser(value: string) {
    return (props: IPersonaProps) => {
        const name = props.text.toLowerCase();
        const email = props.secondaryText.toLowerCase();
        const filter = value.toLowerCase();
        return name.indexOf(filter) !== -1 || email.indexOf(filter) !== -1
            ? true
            : false;
    };
}

const ResponsibleCellCallout: React.FC<IResponsibleCellProps> = (props) => {
    const usersAPI = useUsers();
    const { updateTask, getTask } = useTasks();
    const [users, setUsers] = React.useState<IPersonaProps[]>([]);
    const [searchValue, setSearchValue] = React.useState('');

    React.useEffect(() => {
        usersAPI.getPersonaProps().then((personas) => setUsers(personas));
    }, []);

    const handleClick = React.useCallback((newId: number) => async () => {
        calloutVisibility({visible: false});
        await updateTask(props.node.Id, {
            ResponsibleId: newId,
        });
        taskUpdated(await getTask(props.node.Id));
    }, [props.node]);

    const userElements = React.useMemo(() => {
        return users.filter(filterUser(searchValue)).map((userProps) => (
            <button className={styles.responsible_user} onClick={handleClick(+userProps.id)}>
                <Persona
                    text={userProps.text}
                    size={PersonaSize.size32}
                    id={userProps.id}
                    secondaryText={userProps.secondaryText}
                    imageUrl={userProps.imageUrl}
                />
            </button>
        ));
    }, [users, searchValue]);

    return (
        <div className={`${styles.callout} ${styles.responsible}`}>
            <Text
                variant="medium"
                block
                styles={{ root: { marginBottom: '.5em' } }}
            >
                Change responsible:{' '}
            </Text>
            <SearchBox
                placeholder="Search user"
                value={searchValue}
                onChange={(_ev, value) => setSearchValue(value)}
                disableAnimation
                autoFocus
                clearButtonProps={{
                    tabIndex: -1,
                }}
            />
            <Separator />
            {userElements}
        </div>
    );
};

type IResponsibleCellProps = {
    node: TaskNode;
};

const ResponsibleCell = (props: IResponsibleCellProps) => {
    const task = props.node.getTask();
    const elemRef = React.useRef(null);

    const handleClick = React.useCallback(
        (evt) => {
            calloutVisibility({
                target: elemRef,
                visible: true,
                RenderComponent: ResponsibleCellCallout,
                componentProps: props,
            });
        },
        [props.node]
    );

    return (
        <button className={styles.button} disabled={props.node.Display === 'disabled'} ref={elemRef} onClick={handleClick}>
            <Persona
                text={task.Responsible.Title}
                size={PersonaSize.size24}
                imageUrl={`/_layouts/15/userphoto.aspx?AccountName=${task.Responsible.EMail}&Size=M`}
                title={task.Responsible.Title}
            />
        </button>
    );
};

export default ResponsibleCell;
