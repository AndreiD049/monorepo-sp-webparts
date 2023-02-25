import {
    Label,
    PrimaryButton,
    Stack,
    StackItem,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    APPLICATION,
    CATEGORY,
    ENVIRONMENT,
    FEEDBACK,
    STATUS,
} from '../../constants';
import { $and, $eq } from '../../indexes/filter';
import { Item } from '../../item';
import { itemAdded } from '../../services/events';
import { MainService } from '../../services/main-service';
import { DescriptionEditor } from '../DescriptionEditor';
import { GlobalContext } from '../Feedback';
import { SelectChoice } from '../SelectChoice';
import { SelectDropdown } from '../SelectDropdown';
import { TextField } from '../TextField';
import styles from './FeedbackForm.module.scss';

export interface IFeedbackFormProps {
    // Props go here
}

export const FeedbackForm: React.FC<IFeedbackFormProps> = () => {
    const navigate = useNavigate();
    const { indexManager } = React.useContext(GlobalContext);
    const [item, setItem] = React.useState(
        new Item().setField('status', 'FB:/Status/New')
    );
    const [searchParams] = useSearchParams();

    const handleCreate = React.useCallback(async () => {
        const newItem = await item.addTag(FEEDBACK).replaceImagesIn('text');
        const addResult = await MainService.ItemsService.addItem(
            newItem.asRaw()
        );
        itemAdded(await MainService.ItemsService.getItem(addResult.data.Id));
        setItem(new Item());
        navigate(searchParams.get('from') || '/');
    }, [item]);
    
    return (
        <div className={styles.container}>
            <SelectChoice
                target={item}
                field="application"
                options={indexManager.filterArray($eq('tag', APPLICATION))}
                optionProps={{ imageSize: { width: -1, height: 50 } }}
                choiceGroupProps={{ label: 'Application' }}
                onChange={(newItem) => setItem(newItem.unsetField('category'))}
            />
            <Stack horizontal horizontalAlign="start" tokens={{ childrenGap: '1em' }}>
                <StackItem>
                    <SelectChoice
                        target={item}
                        field="environment"
                        options={indexManager.filterArray($eq('tag', ENVIRONMENT))}
                        choiceGroupProps={{
                            label: 'Environment',
                        }}
                        optionProps={{
                            styles: { labelWrapper: { maxWidth: 80 } },
                        }}
                        onChange={(newItem) => setItem(newItem)}
                    />
                </StackItem>
                <StackItem>
                    <SelectChoice
                        target={item}
                        field="category"
                        options={indexManager
                            .filterArray($and($eq('tag', CATEGORY), $eq('tag', item.getField('application'))))}
                        choiceGroupProps={{
                            label: 'Category',
                        }}
                        onChange={(newItem) => setItem(newItem)}
                    />
                </StackItem>
            </Stack>
            <SelectDropdown
                options={indexManager.filterArray($eq('tag', STATUS))}
                target={item}
                onChange={(result: Item) => {
                    setItem(result);
                }}
                dropDownProps={{ label: 'Status' }}
                field="status"
                style={{ maxWidth: 150 }}
            />
            <TextField
                textFieldProps={{ label: 'Summary' }}
                target={item}
                field="caption"
                onChange={(newItem) => setItem(newItem.setTitle(newItem.getFieldOr('caption', '')))}
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
