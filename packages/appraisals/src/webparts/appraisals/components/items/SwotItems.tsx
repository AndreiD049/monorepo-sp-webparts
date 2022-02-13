import {
    getTheme,
    Stack,
    StackItem,
    themeRulesStandardCreator,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import IItem from '../../dal/IItem';
import IPeriod from '../../dal/IPeriod';
import { getSwotItems } from '../../dal/Items';
import { IUser } from '../../dal/IUser';
import ItemContainer from './ItemContainer';
import styles from './AppraisalItems.module.scss';

export interface IGoalItemsProps {
    user: IUser;
    period: IPeriod;
}

const theme = getTheme();

const SwotItems: FC<IGoalItemsProps> = (props) => {
    const [items, setItems] = React.useState<IItem[]>([]);

    const strengthItems = React.useMemo(() => {
        return items.filter((item) => item.ItemType === 'Strength');
    }, [items]);

    const weaknessItems = React.useMemo(() => {
        return items.filter((item) => item.ItemType === 'Weakness');
    }, [items]);

    const opportunityItems = React.useMemo(() => {
        return items.filter((item) => item.ItemType === 'Opportunity');
    }, [items]);

    const threatItems = React.useMemo(() => {
        return items.filter((item) => item.ItemType === 'Threat');
    }, [items]);

    React.useEffect(() => {
        async function run() {
            if (props.user && props.period) {
                const result = await getSwotItems(
                    props.period.ID,
                    props.user?.Id
                );
                setItems(result);
            }
        }
        run();
    }, [props.user, props.period]);

    if (!props.period) return null;

    return (
        <Stack verticalAlign="center" horizontalAlign="center">
            <span
                className={styles.container}
                style={{
                    boxShadow: theme.effects.elevation4,
                    padding: '0 1em',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexFlow: 'row wrap',
                    }}
                >
                    {/* Strength */}
                    <ItemContainer
                        className={`${styles.buttonLeft} ${styles.itemsGroup} ${styles.simple}`}
                        items={strengthItems}
                        minItems={Math.max(
                            strengthItems.length + 1,
                            weaknessItems.length + 1,
                            5
                        )}
                        status="NA"
                        title="Strength"
                        itemType="Strength"
                        period={props.period}
                        userId={props.user?.Id}
                        setItems={setItems}
                    />
                    {/* Weakness */}
                    <ItemContainer
                        className={`${styles.itemsGroup} ${styles.simple}`}
                        items={weaknessItems}
                        minItems={Math.max(
                            strengthItems.length + 1,
                            weaknessItems.length + 1,
                            5
                        )}
                        status="NA"
                        title="Weakness"
                        itemType="Weakness"
                        period={props.period}
                        userId={props.user?.Id}
                        setItems={setItems}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexFlow: 'row wrap',
                    }}
                >
                    {/* Opportunity */}
                    <ItemContainer
                        className={`${styles.buttonLeft} ${styles.itemsGroup} ${styles.simple} ${styles.bottom}`}
                        items={opportunityItems}
                        minItems={Math.max(
                            opportunityItems.length + 1,
                            threatItems.length + 1,
                            5
                        )}
                        status="NA"
                        title="Opportunity"
                        itemType="Opportunity"
                        period={props.period}
                        userId={props.user?.Id}
                        setItems={setItems}
                    />
                    {/* Threats */}
                    <ItemContainer
                        className={`${styles.itemsGroup} ${styles.simple} ${styles.bottom}`}
                        items={threatItems}
                        minItems={Math.max(
                            opportunityItems.length + 1,
                            threatItems.length + 1,
                            5
                        )}
                        status="NA"
                        title="Threat"
                        itemType="Threat"
                        period={props.period}
                        userId={props.user?.Id}
                        setItems={setItems}
                    />
                </div>
            </span>
        </Stack>
    );
};

export default SwotItems;
