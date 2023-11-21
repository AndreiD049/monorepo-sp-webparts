import { getTheme, MessageBarType, Separator, Stack, StackItem, Text } from '@fluentui/react';
import * as React from 'react';
import IPeriod from '../../dal/IPeriod';
import { IUser } from '../../dal/IUser';
import useForceUpdate from '../../utils/forceUpdate';
import UserContext from '../../utils/UserContext';
import PeoplePicker from '../items/PeoplePicker';
import styles from './PeriodDetails.module.scss';
import { SPnotify } from 'sp-react-notifications';
import * as strings from 'AppraisalsWebPartStrings';
import ObjectiveItems from '../items/ObjectiveItems';
import TrainingItems from '../items/TrainingItems';
import SwotItems from '../items/SwotItems';
import Feedback from '../items/Feedback';

export interface IPeriodDetailsProps {
    ID: string;
}

const theme = getTheme();

/**
 * Page showing the details for the choosen apprisal period
 * There are 3 sections on the appraisal:
 * - Objectives
 * - Trainings
 * - SWOT Matrix
 */
const PeriodDetails: React.FC<IPeriodDetailsProps> = (props) => {
    const context = React.useContext(UserContext);
    const forceUpdate = useForceUpdate();
    const [period, setPeriod] = React.useState<IPeriod>(null);
    const [currentUser, setCurrentUser] = React.useState<IUser>(null);

    React.useEffect(() => {
        async function run() {
            const result = await context.PeriodService.getPeriod(props.ID);
            setPeriod(result);
        }
        run();
    }, [forceUpdate]);

    React.useEffect(() => {
        async function run() {
            const cu = await context.UserService.getCurrentUser();
            setCurrentUser(cu);
            if (!(await context.FolderService.getCurrentUserFolder())) {
                SPnotify({
                    message: 'Folder is not created. Contact administration in order to create it.',
                    messageType: MessageBarType.severeWarning,
                    messageActions: [
                        {
                            text: 'Send mail',
                            onClick: () => window.open(`mailto:${context.properties.defaultSupportEmails}?subject=${strings.CreateFolderMailSubject}&body=${strings.CreateFolderMailBody}`, '_blank'),
                        }
                    ],
                    timeout: 10000,
                });
            }
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
            {/* My Objectives */}
            <Stack
                verticalAlign="center"
                horizontalAlign="center"
                style={{ marginTop: theme.spacing.l1 }}
            >
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">Objectives</Text>
                </Separator>
                <ObjectiveItems user={currentUser} period={period} />
            </Stack>
            {/* Trainings requested by me of my TL */}
            <Stack
                verticalAlign="center"
                horizontalAlign="center"
                style={{ marginTop: theme.spacing.l1 }}
            >
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">Trainings</Text>
                </Separator>
                <TrainingItems user={currentUser} period={period} />
            </Stack>
            {/* My self-evaluation */}
            <StackItem>
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">SWOT</Text>
                </Separator>
                <SwotItems user={currentUser} period={period} />
            </StackItem>
            {/* Feedback */}
            <StackItem>
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">Feedback</Text>
                </Separator>
                <Feedback user={currentUser} period={period} />
            </StackItem>
        </Stack>
    );
};

export default PeriodDetails;
