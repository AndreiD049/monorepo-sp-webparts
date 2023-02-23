import {
    Label,
    PrimaryButton,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { hidePanel } from 'sp-components';
import {
    APPLICATION,
    ENVIRONMENT,
    FEEDBACK,
    MAIN_PANEL,
    STATUS,
} from '../../constants';
import { Item } from '../../item';
import { itemAdded } from '../../services/events';
import { MainService } from '../../services/main-service';
import { DescriptionEditor } from '../DescriptionEditor';
import { GlobalContext } from '../Feedback';
import { SelectDropdown } from '../SelectDropdown';
import styles from './FeedbackForm.module.scss';

export interface IFeedbackFormProps {
    // Props go here
}

export const FeedbackForm: React.FC<IFeedbackFormProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const [item, setItem] = React.useState(new Item().setField('status', 'New'));

    const handleCreate = React.useCallback(async () => {
        const newItem = await item.addTag(FEEDBACK).replaceImagesIn('text');
        const addResult = await MainService.ItemsService.addItem(
            newItem.asRaw()
        );
        itemAdded(await MainService.ItemsService.getItem(addResult.data.Id));
        setItem(new Item());
        hidePanel(MAIN_PANEL);
    }, [item]);

    return (
        <div className={styles.container}>
            <SelectDropdown
                options={indexManager.getArrayBy('tag', APPLICATION)}
                target={item}
                onChange={(result: Item) => {
                    setItem(result);
                }}
                dropDownProps={{ label: 'Application' }}
                field="application"
            />
            <SelectDropdown
                options={indexManager.getArrayBy('tag', ENVIRONMENT)}
                target={item}
                onChange={(result: Item) => {
                    setItem(result);
                }}
                dropDownProps={{ label: 'Environment' }}
                field="environment"
            />
            <SelectDropdown
                options={indexManager.getArrayBy('tag', STATUS)}
                target={item}
                onChange={(result: Item) => {
                    setItem(result);
                }}
                dropDownProps={{ label: 'Status' }}
                field="status"
            />
            <TextField
                label="Summary"
                value={item.Title}
                onChange={(_ev, val) => setItem((prev) => prev.setTitle(val))}
            />
            <Label>
                Description
                <DescriptionEditor
                    onUpdate={(content) =>
                        setItem((prev) => prev.setField('text', content))
                    }
                    content={item.getFieldOr('text', '')}
                />
            </Label>
            <PrimaryButton onClick={handleCreate}>Create</PrimaryButton>
            <pre>{JSON.stringify(item, null, 4)}</pre>
        </div>
    );
};
