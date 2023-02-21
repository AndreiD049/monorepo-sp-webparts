import { Dropdown, IDropdownOption, PrimaryButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { hidePanel } from 'sp-components';
import { APPLICATION, ENVIRONMENT, FEEDBACK, MAIN_PANEL } from '../../constants';
import { Item } from '../../item';
import { itemAdded } from '../../services/events';
import { MainService } from '../../services/main-service';
import { optionsFromItems } from '../../utils';
import { DescriptionEditor } from '../DescriptionEditor';
import { GlobalContext } from '../Feedback';
import styles from './FeedbackForm.module.scss';

export interface IFeedbackFormProps {
    // Props go here
}

export const FeedbackForm: React.FC<IFeedbackFormProps> = (props) => {
    const { index } = React.useContext(GlobalContext);
    const [item, setItem] = React.useState(new Item());
    const apps: IDropdownOption[] = React.useMemo(
        () => optionsFromItems(index.findByTag(APPLICATION)),
        []
    );
    const envs: IDropdownOption[] = React.useMemo(
        () => optionsFromItems(index.findByTag(ENVIRONMENT)),
        []
    );
    
    const handleCreate = React.useCallback(async () => {
        const newItem = await item.addTag(FEEDBACK).replaceImagesIn('text');
        const addResult = await MainService.ItemsService.addItem(newItem.asRaw());
        itemAdded(await MainService.ItemsService.getItem(addResult.data.Id))
        setItem(new Item());
        hidePanel(MAIN_PANEL);
    }, [item]);

    return (
        <div className={styles.container}>
            <Dropdown
                options={apps}
                label="Application"
                onChange={(_ev, option) => {
                    setItem((prev) => prev.setField('application', option.text));
                }}
                selectedKey={item.getField('application')}
            />
            <Dropdown
                options={envs}
                label="Environment"
                onChange={(_ev, option) => {
                    setItem((prev) =>
                        prev.setField('environment', option.text)
                    );
                }}
                selectedKey={item.getField('environment')}
            />
            <TextField label="Summary" value={item.Title} onChange={(_ev, val) => setItem((prev) => prev.setTitle(val))} />
            <DescriptionEditor onUpdate={(content) => setItem((prev) => prev.setField('text', content))} />
            <PrimaryButton onClick={handleCreate}>Create</PrimaryButton>
            <pre>{JSON.stringify(item, null, 4)}</pre>
        </div>
    );
};
