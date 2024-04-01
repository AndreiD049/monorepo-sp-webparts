import { ICustomerFlow } from '@service/process-flow';
import { isNaN } from 'lodash';
import { IconButton } from '@fluentui/react';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainService } from '../../services/main-service';
import { CustomerGroupPicker } from '../CustomerGroupPicker';
import { DBCustomersPicker } from '../DBCustomersPicker';
import { StatusLegend } from '../StatusLegend';
import { UserPicker } from '../UserPicker';
import styles from './ProcessFlowHeader.module.scss';

export interface IProcessFlowHeaderProps {
    flow?: ICustomerFlow;
}

export const ProcessFlowHeader: React.FC<IProcessFlowHeaderProps> = (props) => {
    const { CustomerFlowService } = MainService;
    const [editable, setEditable] = React.useState(false);
    const [selectedCustomerGroup, setSelectedCustomerGroup] = React.useState(
        props.flow?.CustomerGroup
    );
    const [selectedDbCustomers, setSelectedDbCustomers] = React.useState(
        props.flow?.DBCustomers || []
    );
    const [choiceCustomerGroup, setChoiceCustomerGroup] = React.useState([]);
    const [choiceDbCustomers, setChoiceDBCustomers] = React.useState([]);
	const [search, setSearch] = useSearchParams();

    React.useEffect(() => {
        if (props.flow) {
            setEditable(false);
            setSelectedCustomerGroup(props.flow.CustomerGroup);
            setSelectedDbCustomers(props.flow.DBCustomers);
        }
    }, [props.flow]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (editable && choiceCustomerGroup.length === 0) {
                setChoiceCustomerGroup(
                    await CustomerFlowService.getCustomerGroupChoices()
                );
                setChoiceDBCustomers(
                    await CustomerFlowService.getDBCustomerChoices()
                );
            }
        }
        run().catch((err) => console.error(err));
    }, [editable]);

    const handleClickEditSave = React.useCallback(async () => {
        if (!editable) {
            setEditable(true);
        } else {
            await CustomerFlowService.updateFlow(props.flow.Id, {
                CustomerGroup: selectedCustomerGroup,
                DBCustomers: selectedDbCustomers,
            });
            setEditable(false);
        }
    }, [editable, selectedCustomerGroup, selectedDbCustomers]);

    if (!props.flow) return null;

    return (
        <div className={styles.container}>
            <div className={`${styles.customerBox} ${styles.borderedBox}`}>
                <div className={styles.topRow}>
                    <CustomerGroupPicker
                        options={
                            editable
                                ? choiceCustomerGroup
                                : [props.flow.CustomerGroup]
                        }
                        selectedOption={selectedCustomerGroup}
                        onSelect={(group) => setSelectedCustomerGroup(group)}
                        disabled={!editable}
                        style={{
                            display: 'inline-block',
                            minWidth: 180,
                        }}
                    />
                    <IconButton
                        onClick={handleClickEditSave}
                        iconProps={{ iconName: editable ? 'Save' : 'Edit' }}
                    />
                    {editable && (
                        <IconButton
                            onClick={() => setEditable(false)}
                            iconProps={{ iconName: 'Cancel' }}
                        />
                    )}
                </div>
                <DBCustomersPicker
                    options={
                        editable
                            ? choiceDbCustomers
                            : props.flow.DBCustomers || []
                    }
                    selectedOptions={selectedDbCustomers}
                    onSelect={(items) => setSelectedDbCustomers(items)}
                    disabled={!editable}
                    style={{
                        display: 'inline-block',
                        minWidth: 180,
                    }}
                />
            </div>
			<div className={`${styles.borderedBox} ${styles.userPicker}`}>
				<UserPicker
					label="Selected users"
					selectedIds={search.get('users')?.split(',').map(u => +u.trim()).filter((n) => !isNaN(n)) || []}
					onUserSelected={function (users) {
						setSearch((prev) => {
							prev.set('users', users.map(u => u.data).join(', '));
							return prev;
						});
					}}
				/>
			</div>
			<div className={`${styles.borderedBox} ${styles.userPicker}`}>
				<UserPicker
					label="Responsible users"
					selectedIds={search.get('responsible')?.split(',').map(u => +u.trim()).filter((n) => !isNaN(n)) || []}
					onUserSelected={function (users) {
						const no_responsible = users.filter((u) => u.data === -1);
						if (no_responsible.length > 0) {
							setSearch((prev) => {
								prev.set('responsible', '-1');
								return prev;
							});
							return;
						}
						setSearch((prev) => {
							prev.set('responsible', users.map(u => u.data).join(', '));
							return prev;
						});
					}}
					additionalUsers={[{ id: null, data: -1, text: '(Empty)', secondaryText: 'No responsible' }]}
				/>
			</div>
            <StatusLegend />
        </div>
    );
};
