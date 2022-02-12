import { Stack } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import IItem from '../../dal/IItem';
import IPeriod from '../../dal/IPeriod';
import { getItems } from '../../dal/Items';
import { IUser } from '../../dal/IUser';
import ItemContainer from './ItemContainer';
import styles from './ItemContainer.module.scss';

export interface IGoalItemsProps {
    user: IUser;
    period: IPeriod;
}

const GoalItems: FC<IGoalItemsProps> = (props) => {
    const [items, setItems] = React.useState<IItem[]>([]);

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

    React.useEffect(() => {
        async function run() {
            if (props.user && props.period) {
                const result = await getItems(
                    'Goal',
                    props.period.ID,
                    props.user?.Id
                );
                setItems(result);
            }
        }
        run();
    }, [props.user, props.period]);

    return (
        <span className={styles.container} style={{
            padding: '0 1em',
            display: 'flex',
            flexFlow: 'row wrap',
        }}>
                {/* Achieved */}
                <ItemContainer
                    className={`${styles.buttonLeft} ${styles.itemsGroup} ${styles.simple}`}
                    items={achieved}
                    minItems={5}
                    status="Achieved"
                    itemType="Goal"
                    periodId={props.period?.ID}
                    userId={props.user?.Id}
                    setItems={setItems}
                />
                {/* Planned */}
                <ItemContainer
                    className={`${styles.itemsGroup} ${styles.simple}`}
                    items={planned}
                    minItems={5}
                    status="Planned"
                    itemType="Goal"
                    periodId={props.period?.ID}
                    userId={props.user?.Id}
                    setItems={setItems}
                />
        </span>
    );
};

export default GoalItems;
