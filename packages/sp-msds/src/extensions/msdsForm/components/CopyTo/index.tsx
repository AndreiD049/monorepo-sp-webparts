import { DefaultButton, ITag, Label, MessageBar, MessageBarType, PrimaryButton, TagPicker } from '@fluentui/react';
import * as React from 'react';
import { hideDialog, hideSpinner, showSpinner } from 'sp-components';
import { DIALOG_ID, SPINNER_ID } from '../../constants';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import { ItemService } from '../../services/item-service';
import { ICustomer, LookupService } from '../../services/lookup-service';
import styles from './CopyTo.module.scss';

export interface ICopyToProps {
    item: IMSDSRequest;
    sites: string[];
    databasesInit: string[];
    customersInit: ICustomer[];
	onClose: () => void;
}

const emptyErrors = {
		general: '',
		site: '',
		database: '',
		customer: '',
}

export const CopyTo: React.FC<ICopyToProps> = (props) => {
	const [errors, setErrors] = React.useState<{ [key: string]: string }>({...emptyErrors});
	
    const [lookup, setLookup] = React.useState<{
        sites: string[];
        dbs: string[];
        customers: ICustomer[];
    }>({
        sites: props.sites,
        dbs: props.databasesInit,
        customers: props.customersInit,
    });

    const [data, setData] = React.useState<
        Pick<IMSDSRequest, 'CustomerNameId' | 'Site' | 'Database'>
    >({
        CustomerNameId: props.item.CustomerNameId,
        Site: props.item.Site,
        Database: props.item.Database,
    });

    const siteTags = lookup.sites.map((site) => {
        return {
            key: site,
            name: site,
        };
    });

    const databaseTags = lookup.dbs.map((database) => {
        return {
            key: database,
            name: database,
        };
    });

    const customerTags = lookup.customers.map((customer) => {
        return {
            key: customer.Id,
            name: customer.Title,
        };
    });

    const handleFilter: (t: ITag[]) => (f: string, s: ITag[]) => ITag[] =
        (tags: ITag[]) => (filter: string, selected: ITag[]) => {
            if (!filter) {
                return tags;
            }
            return tags.filter(
                (tag) =>
                    tag.name.toLowerCase().includes(filter.toLowerCase()) &&
                    tag.name !== selected[0]?.name
            );
        };

    const handleCustomerFilter = async (filter: string): Promise<ITag[]> => {
        if (!filter) {
            return customerTags;
        }
        const customers = await LookupService.getCustomerFilter(
            filter,
            data.Database || ''
        );
        return customers.map((c) => ({
            key: c.Id,
            name: c.Title,
        }));
    };

	const validate = async (): Promise<boolean> => {
		let isValid = true;

		if (!data.Site) {
			setErrors((prev) => ({ ...prev, site: 'Site is required.' }));
			isValid = false;
		} else {
			setErrors((prev) => ({ ...prev, site: '' }));
		}

		if (!data.Database) {
			setErrors((prev) => ({ ...prev, database: 'Database is required.' }));
			isValid = false;
		} else {
			setErrors((prev) => ({ ...prev, database: '' }));
		}

		if (!data.CustomerNameId) {
			setErrors((prev) => ({ ...prev, customer: 'Customer is required.' }));
			isValid = false;
		} else {
			setErrors((prev) => ({ ...prev, customer: '' }));
		}

		if (!isValid) {
			return false;
		}

		const duplicate = await ItemService.getItem(
			data.CustomerNameId,
			data.Site,
			data.Database,
			props.item.ProductName,
		);
		
		if (duplicate.length > 0) {
			setErrors((prev) => ({ ...prev, general: `Product '${props.item.ProductName}' already exists for this customer/site/database.` }));
			isValid = false;
		} else {
			setErrors((prev) => ({ ...prev, general: '' }));
		}
		return isValid;
	}

	console.log(props.item);

    const handleOk = async (): Promise<void> => {
		try {
			document.getElementById('copy-to-ok-button')?.setAttribute('disabled', 'true');
			document.getElementById('copy-to-cancel-button')?.setAttribute('disabled', 'true');

			const valid = await validate();
			if (!valid) throw new Error('Invalid form data');
			hideDialog(DIALOG_ID);
            showSpinner(SPINNER_ID);

			const payload: { [key: string]: string|number|boolean } = { ...props.item, ...data };
			// remove odata properties and ids
			Object.keys(payload).forEach((key) => {
				if (key.startsWith('@odata') || key.toLowerCase() === 'id') {
					delete payload[key];
				}
			});

			const result = await ItemService.createItem(payload);

			// Copy attachments
			await ItemService.copyAttachments(props.item.Id, result.data.Id);
			
			// Add comment
			const customer = await LookupService.getCustomer(props.item.CustomerNameId);
			const comment = `Copied from: <a href="${location.href}" target="_blank">${props.item.Site} - ${customer.Title} - ${props.item.ProductName}</a>`
			await ItemService.addComment(result.data.Id, { text: comment });

			// if same site, no approval needed
			if (data.Site === props.item.Site) {
				await ItemService.setApprovalStatus(result.data.Id, 'Pending', false);
			} else {
				await ItemService.setApprovalStatus(result.data.Id, 'Pending', true);
			}

			hideSpinner(SPINNER_ID);
			props.onClose();
		} finally {
			hideSpinner(SPINNER_ID);
			document.getElementById('copy-to-ok-button')?.removeAttribute('disabled');
			document.getElementById('copy-to-cancel-button')?.removeAttribute('disabled');
		}
    };


    return (
        <div className={styles.container}>
            <form onSubmit={(ev) => ev.preventDefault()}>
				{ errors.general && <MessageBar messageBarType={MessageBarType.error}>{errors.general}</MessageBar> }
                <Label htmlFor="copy-to-site">Site:</Label>
                <TagPicker
                    inputProps={{ id: 'copy-to-site', required: true }}
                    onEmptyResolveSuggestions={() => siteTags}
                    onResolveSuggestions={handleFilter(siteTags)}
                    itemLimit={1}
                    selectedItems={siteTags.filter(
                        (tag) => tag.name === data.Site
                    )}
                    onChange={async (selected) => {
                        const value =
                            selected.length > 0 ? selected[0].name : null;

                        // Update lookups
                        if (value !== null) {
                            const newDbs =
                                await LookupService.getDatabases(value);
                            setLookup((prev) => ({ ...prev, dbs: newDbs }));
                        } else {
                            setLookup((prev) => ({ ...prev, dbs: [] }));
                        }
                        setData({
                            Site: value,
                            Database: null,
                            CustomerNameId: null,
                        });
                        return selected;
                    }}
                />
				{ errors.site && <MessageBar messageBarType={MessageBarType.error}>{errors.site}</MessageBar> }

                <Label htmlFor="copy-to-database">Database:</Label>
                <TagPicker
                    inputProps={{ id: 'copy-to-database', required: true }}
                    onEmptyResolveSuggestions={() => databaseTags}
                    onResolveSuggestions={handleFilter(databaseTags)}
                    itemLimit={1}
                    selectedItems={databaseTags.filter(
                        (tag) => tag.name === data.Database
                    )}
                    onChange={async (selected) => {
                        const value = selected.length > 0 ? selected[0].name : null;

                        // Update lookups
                        if (value !== null) {
                            const newCustomers =
                                await LookupService.getAllCustomers(value);
                            setLookup((prev) => ({
                                ...prev,
                                customers: newCustomers,
                            }));
                        }

                        setData((prev) => ({
                            ...prev,
                            Database: value,
                            CustomerNameId: null,
                        }));
                        return selected;
                    }}
                />
				{ errors.database && <MessageBar messageBarType={MessageBarType.error}>{errors.database}</MessageBar> }

                <Label htmlFor="copy-to-customer">Customer:</Label>
                <TagPicker
                    inputProps={{ id: 'copy-to-customer', required: true }}
                    onEmptyResolveSuggestions={() => customerTags}
                    onResolveSuggestions={handleCustomerFilter}
                    itemLimit={1}
                    selectedItems={customerTags.filter(
                        (tag) => tag.key === data.CustomerNameId
                    )}
                    onChange={async (selected) => {
                        const value =
                            selected.length > 0 ? selected[0].key : null;
                        if (value !== null) {
                            const exists = lookup.customers.find(
                                (c) => c.Id === +value
                            );
                            if (!exists) {
                                const customer =
                                    await LookupService.getCustomer(+value);
                                setLookup((prev) => ({
                                    ...prev,
                                    customers: [...prev.customers, customer],
                                }));
                            }
                        }
                        setData((prev) => ({
                            ...prev,
                            CustomerNameId: +value,
                        }));
                        return selected;
                    }}
                />
				{ errors.customer && <MessageBar messageBarType={MessageBarType.error}>{errors.customer}</MessageBar> }
            </form>
			<div className={styles.footer}>
				<PrimaryButton id="copy-to-ok-button" className={styles.okButton} onClick={handleOk}>Ok</PrimaryButton>
				<DefaultButton id="copy-to-cancel-button" onClick={() => hideDialog(DIALOG_ID)}>Cancel</DefaultButton>
			</div>
        </div>
    );
};
