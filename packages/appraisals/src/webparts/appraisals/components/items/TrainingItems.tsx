import * as React from 'react';
import { FC } from 'react';
import IItem from '../../dal/IItem';
import IPeriod from '../../dal/IPeriod';
import { IUser } from '../../dal/IUser';
import ItemContainer from './ItemContainer';
import styles from './AppraisalItems.module.scss';
import UserContext from '../../utils/UserContext';
import { adoptOrphanItems } from './utils';

export interface IObjectiveItemsProps {
    user: IUser;
    period: IPeriod;
}

const TrainingItems: FC<IObjectiveItemsProps> = (props) => {
    const { ItemService } = React.useContext(UserContext);
    const [items, setItems] = React.useState<IItem[]>([]);

    // Fetch items
    React.useEffect(() => {
        async function run() {
            if (props.user && props.period) {
                const result = await ItemService.getItems(
                    'Training',
                    props.period.ID,
                    props.user?.Id
                );
                setItems(result);
            }
        }
        run();
    }, [props.user, props.period]);

    // Adopt orphan trainings
    React.useEffect(() => {
        async function run() {
            adoptOrphanItems(props.period, items, setItems, ItemService);
        }
        run();
    }, [items]);

    const achieved = React.useMemo(() => {
        return items.filter(
            (item) =>
                item.ItemStatus === 'Achieved' &&
                +item.AchievedIn?.Id === +props.period.ID
        );
    }, [items]);

    const planned = React.useMemo(() => {
        return items.filter(
            (item) =>
                item.ItemStatus === 'Planned' ||
                +item.AchievedIn?.Id > +props.period.ID
        );
    }, [items]);

    if (!props.period) return null;

    return (
        <span
            className={styles.container}
            style={{
                padding: '0 1em',
                display: 'flex',
                flexFlow: 'row wrap',
            }}
        >
            {/* Achieved */}
            <ItemContainer
                className={`${styles.buttonLeft} ${styles.itemsGroup} ${styles.simple}`}
                items={achieved}
                minItems={3}
                status="Achieved"
                itemType="Training"
                period={props.period}
                userId={props.user?.Id}
                setItems={setItems}
            />
            {/* Planned */}
            <ItemContainer
                className={`${styles.itemsGroup} ${styles.simple}`}
                items={planned}
                minItems={3}
                status="Planned"
                itemType="Training"
                period={props.period}
                userId={props.user?.Id}
                setItems={setItems}
            />
        </span>
    );
};

export default TrainingItems;
