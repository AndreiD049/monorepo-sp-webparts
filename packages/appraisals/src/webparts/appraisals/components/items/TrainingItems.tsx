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

const TrainingItems: FC<IGoalItemsProps> = (props) => {
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
                    'Training',
                    props.period.ID,
                    props.user?.Id
                );
                setItems(result);
            }
        }
        run();
    }, [props.user, props.period]);

    return (
        <Stack
            horizontal
            horizontalAlign="space-evenly"
            verticalAlign="stretch"
            wrap
        >
            {/* Achieved */}
            <div
                style={{
                    margin: '1em 3em',
                    minWidth: 400,
                }}
            >
                <ItemContainer
                    className={styles.buttonLeft}
                    items={achieved}
                    minItems={3}
                    status="Achieved"
                    itemType="Training"
                    periodId={props.period?.ID}
                    userId={props.user?.Id}
                    setItems={setItems}
                />
            </div>
            {/* Planned */}
            <div
                style={{
                    margin: '1em 3em',
                    minWidth: 400,
                }}
            >
                <ItemContainer
                    items={planned}
                    minItems={3}
                    status="Planned"
                    itemType="Training"
                    periodId={props.period?.ID}
                    userId={props.user?.Id}
                    setItems={setItems}
                />
            </div>
        </Stack>
    );
};

export default TrainingItems;
