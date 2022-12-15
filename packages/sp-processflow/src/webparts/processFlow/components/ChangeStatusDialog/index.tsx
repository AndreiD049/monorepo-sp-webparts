import { IProcess, IUserProcess } from '@service/process-flow';
import { IUserProps } from '@service/users';
import {
    DatePicker,
    Dropdown,
    IDropdownOption,
    MessageBar,
    MessageBarType,
    Persona,
    PersonaSize,
    PrimaryButton,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { hideDialog } from 'sp-components';
import { MainService } from '../../services/main-service';
import { MAIN_DIALOG } from '../../utils/constants';
import { GlobalContext } from '../../utils/globalContext';
import styles from './ChangeStatusDialog.module.scss';

export interface IChangeStatusDialogProps {
    userProcess: IUserProcess | undefined;
    user: IUserProps;
    process: IProcess;
}

export const ChangeStatusDialog: React.FC<IChangeStatusDialogProps> = (
    props
) => {
    const { selectedTeam } = React.useContext(GlobalContext);
    const { UserProcessService } = MainService;
    const [data, setData] = React.useState<Partial<IUserProcess>>({
        Status: props.userProcess ? props.userProcess.Status : 'NA',
        Date: props.userProcess ? props.userProcess.Date : null,
    });
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        setData({
            Status: props.userProcess ? props.userProcess.Status : 'NA',
            Date: props.userProcess ? props.userProcess.Date : null,
        });
    }, [props.userProcess]);

    const statusOptions: IDropdownOption[] = React.useMemo(() => {
        const options: IUserProcess['Status'][] = [
            'NA',
            'Planned',
            'On-going',
            'Completed',
        ];
        return options.map((o) => ({
            key: o,
            text: o,
            data: o,
        }));
    }, []);

    const handleSave = React.useCallback(async () => {
        // validate first
        if (data.Status !== 'NA' && !data.Date) {
            setError('Date is required.');
            return;
        } else {
            setError(null);
        }
        hideDialog(MAIN_DIALOG);
        if (!props.userProcess?.Id) {
            // Create a new userprocess
            await UserProcessService.addUserProcess({
                FlowId: props.process.FlowId,
                ProcessId: props.process.Id,
                Team: selectedTeam,
                UserId: props.user.Id,
                Status: data.Status,
                Date: data.Date,
            });
        } else {
            await UserProcessService.updateUserProcess(
                props.userProcess.Id,
                data
            );
        }
    }, [data, selectedTeam]);

    const handleChangeStatus = React.useCallback(
        (prevStatus: IUserProcess['Status'], status: IUserProcess['Status']) => {
            if (prevStatus === status) return;
            switch (status) {
                case 'NA':
                case 'Completed':
                    setData((prev) => ({ Status: status, Date: null }));
                    break;
                default:
                    setData((prev) => ({ ...prev, Status: status }));
                    break;
            }
        },
        []
    );

    const getDateLabel = React.useCallback(() => {
        switch (data.Status) {
            case 'Completed':
                return 'Date completed';
            case 'On-going':
            case 'Planned':
                return 'Date planned';
            default:
                return 'Date';
        }
    }, [data.Status]);

    return (
        <div className={styles.container}>
            <Persona
                text={props.user.Title}
                size={PersonaSize.size40}
                imageUrl={`/_layouts/15/userphoto.aspx?accountname=${props.user.EMail}&Size=M`}
            />
            <Dropdown
                label="Status"
                required
                options={statusOptions}
                selectedKey={data.Status}
                onChange={(_ev, option) => {
                    handleChangeStatus(data.Status ,option.data);
                }}
            />
            <DatePicker
                label={getDateLabel()}
                isRequired={data.Status !== 'NA'}
                disabled={data.Status === 'NA'}
                value={data.Date ? new Date(data.Date) : null}
                allowTextInput
                disableAutoFocus
                onSelectDate={(date) => {
                    if (date) {
                        setData((prev) => ({
                            ...prev,
                            Date: date.toISOString(),
                        }));
                    }
                }}
            />
            {error && (
                <MessageBar messageBarType={MessageBarType.error}>
                    {error}
                </MessageBar>
            )}
            <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
        </div>
    );
};
