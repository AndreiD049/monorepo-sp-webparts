import { getTheme, Stack } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import IItem from '../../dal/IItem';
import IPeriod from '../../dal/IPeriod';
import { getSwotItems } from '../../dal/Items';
import { IUser } from '../../dal/IUser';
import ItemContainer from './ItemContainer';
import styles from './ItemContainer.module.scss';

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

    return (
        <Stack verticalAlign="stretch" style={{ marginTop: theme.spacing.l1 }}>
            <Stack
                horizontal
                horizontalAlign="center"
                verticalAlign="stretch"
                wrap
            >
                {/* Strength */}
                <div
                    style={{
                        minWidth: 400,
                        marginRight: theme.spacing.s2,
                        marginBottom: theme.spacing.s2,
                    }}
                >
                    <ItemContainer
                        className={styles.buttonLeft}
                        items={strengthItems}
                        minItems={Math.max(strengthItems.length + 1, weaknessItems.length + 1, 5)}
                        status="NA"
                        title="Strength"
                        itemType="Strength"
                        periodId={props.period?.ID}
                        userId={props.user?.Id}
                        setItems={setItems}
                    />
                </div>
                {/* Weakness */}
                <div
                    style={{
                        minWidth: 400,
                        marginLeft: theme.spacing.s2,
                        marginBottom: theme.spacing.s2,
                    }}
                >
                    <ItemContainer
                        items={weaknessItems}
                        minItems={Math.max(strengthItems.length + 1, weaknessItems.length + 1, 5)}
                        status="NA"
                        title="Weakness"
                        itemType="Weakness"
                        periodId={props.period?.ID}
                        userId={props.user?.Id}
                        setItems={setItems}
                    />
                </div>
            </Stack>
            <Stack
                horizontal
                horizontalAlign="center"
                verticalAlign="stretch"
                wrap
            >
                {/* Opportunity */}
                <div
                    style={{
                        minWidth: 400,
                        marginRight: theme.spacing.s2,
                        marginTop: theme.spacing.s2,
                    }}
                >
                    <ItemContainer
                        className={styles.buttonLeft}
                        items={opportunityItems}
                        minItems={Math.max(opportunityItems.length + 1, threatItems.length + 1, 5)}
                        status="NA"
                        title="Opportunity"
                        itemType="Opportunity"
                        periodId={props.period?.ID}
                        userId={props.user?.Id}
                        setItems={setItems}
                    />
                </div>
                {/* Threats */}
                <div
                    style={{
                        minWidth: 400,
                        marginLeft: theme.spacing.s2,
                        marginTop: theme.spacing.s2,
                    }}
                >
                    <ItemContainer
                        items={threatItems}
                        minItems={Math.max(opportunityItems.length + 1, threatItems.length + 1, 5)}
                        status="NA"
                        title="Threat"
                        itemType="Threat"
                        periodId={props.period?.ID}
                        userId={props.user?.Id}
                        setItems={setItems}
                    />
                </div>
            </Stack>
        </Stack>
    );
};

export default SwotItems;
