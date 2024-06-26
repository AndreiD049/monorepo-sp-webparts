import { Stack, TextField } from '@fluentui/react';
import * as React from 'react';
import IItem from '../../dal/IItem';
import IPeriod from '../../dal/IPeriod';
import { IUser } from '../../dal/IUser';
import UserContext from '../../utils/UserContext';
import styles from './AppraisalItems.module.scss';
import { emptyItem, handleItemUpdate, setItemAction } from './utils';

export interface IFeedbackProps {
    user: IUser;
    period: IPeriod;
}

const Feedback: React.FC<IFeedbackProps> = (props) => {
    const { ItemService } = React.useContext(UserContext);
    const [originalItem, setOriginalItem] = React.useState<IItem>(null);
    const [item, setItem] = React.useState<IItem>(null);
    const disabled = React.useMemo(
        () => props.period?.Status === 'Finished',
        [props.period]
    );

    React.useEffect(() => {
        async function run() {
            if (props.period && props.user) {
                const itemResult = (
                    await ItemService.getItems('Feedback', props.period.ID, props.user.Id)
                )[0];
                setOriginalItem(itemResult ?? emptyItem('Feedback'));
                setItem(itemResult ?? emptyItem('Feedback'));
            }
        }
        run();
    }, [props]);

    const setItemHandler = (actionObject: setItemAction) => {
        switch (actionObject.action) {
            case 'create':
            case 'update':
                setItem(actionObject.item);
                setOriginalItem(actionObject.item);
                break;
            case 'delete':
                setItem(emptyItem('Feedback'));
                setOriginalItem(emptyItem('Feedback'));
                break;
            default:
                throw new Error(
                    `Invalid action received ${actionObject.action}`
                );
        }
    };

    const handleValueUpdate = React.useCallback(async () => {
        await handleItemUpdate(
            originalItem,
            item.Content,
            'NA',
            'Feedback',
            props.period.ID,
            props.user.Id,
            setItemHandler
        );
    }, [props, item, originalItem]);

    const handleBlur = React.useCallback(() => {
        if (item.Content !== originalItem.Content) {
            handleValueUpdate();
        }
    }, [props, item, originalItem]);

    if (!props.period || !props.user) return null;

    return (
        <Stack horizontal horizontalAlign="center">
            <div className={styles.feedbackContainer}>
                <TextField
                    multiline
                    resizable={false}
                    autoAdjustHeight
                    disabled={disabled}
                    onBlur={!disabled && handleBlur}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(_e: any, newVal: string) =>
                        setItem((prev) => ({
                            ...prev,
                            Content: newVal,
                        }))
                    }
                    value={item?.Content}
                />
            </div>
        </Stack>
    );
};

export default Feedback;
