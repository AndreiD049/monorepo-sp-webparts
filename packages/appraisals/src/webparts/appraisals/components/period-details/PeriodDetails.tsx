import {
    getTheme,
    Stack,
    StackItem,
} from '@microsoft/office-ui-fabric-react-bundle';
import { Separator, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import IPeriod from '../../dal/IPeriod';
import { IUser } from '../../dal/IUser';
import { getPeriod } from '../../dal/Periods';
import { getCurrentUser } from '../../dal/Users';
import useForceUpdate from '../../utils/forceUpdate';
import UserContext from '../../utils/UserContext';
import GoalItems from '../items/GoalItems';
import PeoplePicker from '../items/PeoplePicker';
import SwotItems from '../items/SwotItems';
import TrainingItems from '../items/TrainingItems';
import styles from './PeriodDetails.module.scss';

export interface IPeriodDetailsProps {
    ID: string;
}

const theme = getTheme();

/**
 * Page showing the details for the choosen apprisal period
 * There are 3 sections on the appraisal:
 * - Goals
 * - Trainings
 * - SWOT Matrix
 */
const PeriodDetails = (props: IPeriodDetailsProps) => {
    const context = React.useContext(UserContext);
    const forceUpdate = useForceUpdate();
    const [period, setPeriod] = React.useState<IPeriod>(null);
    const [currentUser, setCurrentUser] = React.useState<IUser>(null);

    React.useEffect(() => {
        async function run() {
            const result = await getPeriod(props.ID);
            setPeriod(result);
        }
        run();
    }, [forceUpdate]);

    React.useEffect(() => {
        async function run() {
            setCurrentUser(await getCurrentUser());
        }
        run();
    }, []);

    return (
        <Stack horizontalAlign="center" tokens={{ childrenGap: 12 }}>
            <StackItem align="stretch">
                <Text
                    variant="xLarge"
                    block
                    style={{
                        marginTop: theme.spacing.m,
                        textAlign: 'center',
                    }}
                >
                    Appraisal Details
                </Text>
                <Text
                    variant="medium"
                    block
                    style={{
                        textAlign: 'center',
                        color: theme.palette.neutralSecondary,
                    }}
                >
                    {period ? period.Title : 'Loading...'}
                </Text>
            </StackItem>
            <StackItem>
                <PeoplePicker
                    people={context.teamUsers}
                    selected={currentUser}
                    setSelected={setCurrentUser}
                />
            </StackItem>
            <Stack verticalAlign="center" horizontalAlign="center" style={{ marginTop: theme.spacing.l1 }}>
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">Goals</Text>
                </Separator>
                <GoalItems user={currentUser} period={period} />
            </Stack>
            {/* My goals */}
            <Stack verticalAlign="center" horizontalAlign="center" style={{ marginTop: theme.spacing.l1 }}>
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">Trainings</Text>
                </Separator>
                <TrainingItems user={currentUser} period={period} />
            </Stack>
            {/* Trainings requested by me of my TL */}
            <StackItem>
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">SWOT</Text>
                </Separator>
                <SwotItems user={currentUser} period={period} />
            </StackItem>
            {/* My self-evaluation */}
        </Stack>
    );
};

export default PeriodDetails;
