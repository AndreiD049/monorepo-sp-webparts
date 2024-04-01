import {
    FlowLocationService,
    IFlowLocation,
    IUserProcess,
    UserProcessService,
} from '@service/process-flow';
import { MessageBarType } from '@fluentui/react';
import * as React from 'react';
import { showDialog, FooterYesNo, hideDialog } from 'sp-components';
import { SPnotify } from 'sp-react-notifications';
import { MainService } from '../../services/main-service';
import { MAIN_DIALOG } from '../../utils/constants';
import {
    listenLocationCopy,
    listenLocationPaste,
    listenUserProcessCopy,
    listenUserProcessPaste,
} from '../../utils/events';
import { GlobalContext } from '../../utils/globalContext';

export const useCopyPaste = (): void => {
    const { selectedFlow, selectedTeam } = React.useContext(GlobalContext);
    const { UserProcessService, FlowLocationService } = MainService;
    const [copiedUserProcess, setCopiedUserProcess] =
        React.useState<IUserProcess>(null);
    const [copiedLocation, setCopiedLocation] = React.useState<
        IFlowLocation | 'empty'
    >(null);

    const nothingCopiedMessage = React.useCallback(() => {
        SPnotify({
            message: `Nothing copied`,
            messageType: MessageBarType.severeWarning,
        });
    }, []);

    const askYesNo = React.useCallback(
        (title: string, subText: string, onYes: () => Promise<void>): void => {
            showDialog({
                id: MAIN_DIALOG,
                dialogProps: {
                    dialogContentProps: {
                        title,
                        subText,
                    },
                },
                footer: (
                    <FooterYesNo
                        onYes={async () => {
                            await onYes();
                            hideDialog(MAIN_DIALOG);
                        }}
                        onNo={() => {
                            hideDialog(MAIN_DIALOG);
                        }}
                    />
                ),
            });
        },
        []
    );

    React.useEffect(() => {
        const removeCopy = listenUserProcessCopy((up) => {
            setCopiedUserProcess(up);
        });
        return () => {
            removeCopy();
        };
    }, []);

    React.useEffect(() => {
        const removePaste = listenUserProcessPaste(async (data) => {
            if (!copiedUserProcess) {
                nothingCopiedMessage();
            } else {
                const alreadyCreated =
                    await UserProcessService.getByUserProcess(
                        data.processId,
                        data.userId
                    );
                const updatePayload: Parameters<
                    UserProcessService['addUserProcess']
                >['0'] = {
                    FlowId: selectedFlow.Id,
                    Date: copiedUserProcess.Date,
                    Status: copiedUserProcess.Status,
                    Team: selectedTeam,
                    UserId: data.userId,
                    ProcessId: data.processId,
                };
                if (alreadyCreated.length === 0) {
                    await UserProcessService.addUserProcess(updatePayload);
                } else {
                    // If there is more than 1 user-process for this user
                    if (alreadyCreated.length > 1) {
                        // Delete
                        for (const up of alreadyCreated.slice(1)) {
                            await UserProcessService.removeUserProcess(up.Id);
                        }
                    }
                    if (alreadyCreated[0].Status === 'Completed') {
                        askYesNo('Update?', 'Overwrite existing item', async () => {
                            // Update
                            await UserProcessService.updateUserProcess(
                                alreadyCreated[0].Id,
                                updatePayload
                            );
                            hideDialog(MAIN_DIALOG);
                        });
                    } else {
                        await UserProcessService.updateUserProcess(
                            alreadyCreated[0].Id,
                            updatePayload
                        );
                        hideDialog(MAIN_DIALOG);
                    }
                }
            }
        });
        return () => {
            removePaste();
        };
    }, [copiedUserProcess, selectedFlow, selectedTeam]);

    React.useEffect(() => {
        const removeCopy = listenLocationCopy((location) => {
            setCopiedLocation(location);
            let message: string = 'Copied';
            if (location !== 'empty') {
                message = `Location copied.\nLocation: ${
                    location.Title
                }\nDone by: ${location.DoneBy?.join('/')}`;
            }
            SPnotify({
                message,
                messageType: MessageBarType.success,
            });
        });
        return () => {
            removeCopy();
        };
    }, []);

    React.useEffect(() => {
        const removePaste = listenLocationPaste(async (data) => {
            if (!copiedLocation) {
                return nothingCopiedMessage();
            }
            const locations = await FlowLocationService.getByProcess(
                data.processId
            );
            const exists = locations.find((l) => l.Title === data.title);
            if (copiedLocation === 'empty') {
                // Delete
                if (exists)
                    await FlowLocationService.removeFlowLocation(exists.Id);
                return;
            }
            const payload: Parameters<
                FlowLocationService['addFlowLocation']
            >['0'] = {
                Title: data.title,
                FlowId: selectedFlow.Id,
                ProcessId: data.processId,
                DoneBy: copiedLocation.DoneBy,
                Country: copiedLocation.Country,
            };
            if (!exists) {
                // Create new
                await FlowLocationService.addFlowLocation(payload);
            } else {
                // Update
                await FlowLocationService.updateFlowLocation(
                    exists.Id,
                    payload
                );
            }
        });
        return () => removePaste();
    }, [copiedLocation, selectedFlow]);
};
