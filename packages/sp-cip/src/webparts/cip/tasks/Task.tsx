import {
    Facepile,
    IColumn,
    IconButton,
    IDetailsRowProps,
    OverflowButtonType,
    Persona,
    PersonaSize,
    Text,
    themeRulesStandardCreator,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { ITask } from './ITask';
import styles from './Task.module.scss';
import Pill from '../components/Pill/Pill';
import Timing from '../components/Timing';
import { Items } from 'sp-preset';
import { TaskContext } from './TaskContext';
import { GlobalContext } from '../utils/GlobalContext';
export interface ITaskProps {
    rowProps: IDetailsRowProps;
    nestLevel: number;
}

/**
 * Dictionary containing field properties as keys, and a function
 * showing how to render this property in a table
 */
type RenderMapType = {
    [field in keyof Partial<ITask> & 'default']: (
        col: IColumn,
        props: IDetailsRowProps
    ) => React.ReactElement;
};

const RenderMap: RenderMapType = {
    default: (col: IColumn, props: IDetailsRowProps) => (
        <Text variant="medium" block>
            {props.item[col.fieldName]}
        </Text>
    ),
    Title: (col: IColumn, props: IDetailsRowProps) => {
        return (
            <TaskContext.Consumer>
                {(ctx) => {
                    return (
                        <div
                            style={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                alignItems: 'center',
                                justifyContent: 'start',
                                marginLeft: 30 * ctx.nestLevel,
                            }}
                        >
                            <IconButton
                                iconProps={{ iconName: ctx.open ? 'ChevronFold10' : 'ChevronUnfold10' }}
                                onClick={() => ctx.setOpen(prev => !prev)}
                            />
                            <Text variant="medium" block>
                                {props.item[col.fieldName]}
                            </Text>
                        </div>
                    );
                }}
            </TaskContext.Consumer>
        );
    },
    Priority: (_col, props) => {
        return (
            <Pill
                style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: '5px',
                }}
                value={props.item['Priority']}
            />
        );
    },
    Responsible: (_col, props) => {
        const item: ITask = props.item;
        if (!item.Responsible) return null;
        if (item.Responsible.length === 1) {
            return (
                <Persona
                    text={item.Responsible[0].Title}
                    size={PersonaSize.size24}
                    imageUrl={`/_layouts/15/userphoto.aspx?AccountName=${item.Responsible[0].EMail}&Size=M`}
                    title={item.Responsible[0].Title}
                />
            );
        }
        return (
            <Facepile
                personas={item.Responsible.map((pers) => ({
                    personaName: pers.Title,
                    imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${pers.EMail}&Size=M`,
                }))}
                maxDisplayablePersonas={3}
                overflowButtonType={OverflowButtonType.descriptive}
                overflowButtonProps={{
                    ariaLabel: 'More users',
                }}
                personaSize={PersonaSize.size24}
                styles={{
                    members: {
                        paddingRight: '10px',
                    },
                    member: {
                        marginRight: '-10px',
                    },
                }}
            />
        );
    },
    Status: (_col, props) => {
        return <Pill value={props.item?.Status} />;
    },
    Progress: (_col, props) => {
        return <Text variant="medium">{`${props.item?.Progress * 100}%`}</Text>;
    },
    DueDate: (_col, props) => (
        <Text variant="medium">
            {new Date(props.item.DueDate).toLocaleDateString()}
        </Text>
    ),
    Timing: (_col, props) => {
        const item: ITask = props.item;
        return (
            <Timing
                estimatedTime={item.EstimatedTime}
                effectiveTime={item.EffectiveTime}
            />
        );
    },
};

/**
 * How to render a task.
 * Task is rendered from the columns provided from outside (from a DetailsList)
 * Each cell is rendered according to a Render Map (see above)
 * If a task has children, it can render additional nested tasks
 * * Additional tasks are lazily loaded, showing a Shimmer while
 * * subtasks are loading (https://developer.microsoft.com/en-us/fluentui#/controls/web/shimmer)
 */
const Task: React.FC<ITaskProps> = (props) => {
    const [open, setOpen] = React.useState<boolean>(false);
    return (
        <TaskContext.Provider
            value={{
                open: open,
                setOpen: setOpen,
                nestLevel: props.nestLevel,
            }}
        >
            <div className={styles.task}>
                {props.rowProps.columns.map((column) => {
                    let key =
                        column.fieldName in RenderMap
                            ? column.fieldName
                            : 'default';
                    const cell = RenderMap[key](column, props.rowProps);
                    return (
                        <div
                            className={styles.task__cell}
                            style={{
                                width: column.calculatedWidth,
                            }}
                        >
                            {cell}
                        </div>
                    );
                })}
            </div>
            {open ? <Task rowProps={props.rowProps} nestLevel={props.nestLevel + 1} /> : null}
        </TaskContext.Provider>
    );
};

export default Task;
