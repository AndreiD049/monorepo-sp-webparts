import {
    getTheme,
    IconButton,
    IContextualMenuItem,
    Stack,
    StackItem,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import IItem, { ItemStatus } from '../../dal/IItem';
import styles from './ItemContainer.module.scss';

const LENGTH_TRESHOLD = 50;
export interface IItemFieldProps {
    item: IItem;
    handleBlur?: (value: string) => void;
    handleUpdateStatus?: (value: ItemStatus) => void;
    actions?: IContextualMenuItem[];
}

const theme = getTheme();

const ItemField: FC<IItemFieldProps> = (props) => {
    const [value, setValue] = React.useState<string>(props.item.Content);
    const handleBlur = () => {
        /* If value didn't change, do nothing */
        if (value !== props.item.Content) {
            props.handleBlur(value);
        }
    };

    return (
        <Stack
            horizontal
            horizontalAlign="stretch"
            verticalAlign="center"
            styles={{
                root: {
                    marginTop: theme.spacing.s1,
                },
            }}
        >
            <StackItem grow={1} data-element="input">
                <TextField
                    styles={{
                        fieldGroup: {
                            minHeight: 30,
                            borderRadius: 0,
                        },
                    }}
                    multiline={value.length > LENGTH_TRESHOLD}
                    resizable={false}
                    autoAdjustHeight
                    borderless
                    value={value}
                    onChange={(_e: any, newVal: string) => setValue(newVal)}
                    onBlur={handleBlur}
                />
            </StackItem>
            {props.actions ? (
                <StackItem data-element="button">
                    <IconButton
                        tabIndex={-1}
                        className={styles.actionButton}
                        iconProps={{ iconName: 'MoreVertical' }}
                        styles={{
                            menuIcon: {
                                display: 'none',
                            },
                            root: {
                                borderRadius: 0,
                            }
                        }}
                        menuProps={{
                            isBeakVisible: false,
                            items: props.actions,
                        }}
                    />
                </StackItem>
            ) : null}
        </Stack>
    );
};

export default ItemField;
