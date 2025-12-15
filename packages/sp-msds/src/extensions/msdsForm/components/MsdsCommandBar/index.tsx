import { CommandBar } from '@fluentui/react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';
import { showDialog } from 'sp-components';
import { DIALOG_ID } from '../../constants';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import { ICustomer, LookupService } from '../../services/lookup-service';
import { CopyTo } from '../CopyTo';
import styles from './MsdsCommandBar.module.scss';

export interface IMsdsCommandBarProps {
    item: IMSDSRequest;
    onClose: () => void;
    displayMode: FormDisplayMode;
}

const buttonStyles = {
    backgroundColor: 'inherit',
    color: 'inherit',
};

export const MsdsCommandBar: React.FC<IMsdsCommandBarProps> = (props) => {
    const items = [];

    if (props.displayMode !== FormDisplayMode.New) {
        items.push({
            key: 'copyto',
            text: 'Copy to',
            iconProps: { iconName: 'Copy' },
            buttonStyles: {
                root: buttonStyles,
                icon: buttonStyles,
            },
            onClick: () => {
                const requests = [
                    LookupService.getAllSites(),
                    LookupService.getDatabases(props.item.Site),
                    LookupService.getAllCustomers(props.item.Database),
                    LookupService.getCustomer(props.item.CustomerNameId ?? -1),
                ];
                Promise.all(requests)
                    .then((result) => {
                        const [sites, dbs, customers, customer] = [
                            result[0] as string[],
                            result[1] as string[],
                            result[2] as ICustomer[],
                            result[3] as ICustomer,
                        ];
                        const exists =
                            customers.filter(
                                (c) => c.Id === props.item.CustomerNameId
                            ).length > 0;
                        if (!exists) {
                            customers.push(customer);
                        }
                        showDialog({
                            id: DIALOG_ID,
                            content: (
                                <CopyTo
                                    item={props.item}
                                    sites={sites}
                                    databasesInit={dbs}
                                    customersInit={customers}
                                    onClose={props.onClose}
                                />
                            ),
                            dialogProps: {
                                dialogContentProps: {
                                    title: 'Copy to',
                                },
                            },
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            },
        });
    }

    return (
        <div className={styles.container}>
            <CommandBar
                styles={{
                    root: buttonStyles,
                }}
                items={items}
            />
        </div>
    );
};
