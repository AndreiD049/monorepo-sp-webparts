import { Dropdown, Icon, IDropdownOption } from 'office-ui-fabric-react';
import * as React from 'react';
import { SELECTED_LAYOUT } from '../../constants';
import { $eq } from '../../indexes/filter';
import { Item } from '../../item';
import { dispatchItemAdded, dispatchItemUpdated } from '../../services/events';
import { GlobalContext } from '../Feedback';
import styles from './LayoutSelect.module.scss';

export interface ILayoutSelectProps {
    // Props go here
}

export const SINGLE_COL = 'single';
export const DOUBLE_COL = 'double';
export const TRIPLE_COL = 'triple';

const options: IDropdownOption[] = [
    {
        key: SINGLE_COL,
        text: 'One column',
        data: {
            icon: 'SingleColumn',
        },
    },
    {
        key: DOUBLE_COL,
        text: 'Two columns',
        data: {
            icon: 'DoubleColumn',
        },
    },
    {

        key: TRIPLE_COL,
        text: 'Three columns',
        data: {
            icon: 'TripleColumn',
        },
    },
];
const iconStyles = { marginRight: '8px' };

function createTempItemSelectedLayout(option: IDropdownOption): Item {
    return new Item().setTitle(SELECTED_LAYOUT).setField('layout', option.key);
}

export const LayoutSelect: React.FC<ILayoutSelectProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);

    const onRenderOption = (option: IDropdownOption): JSX.Element => {
        return (
            <div>
                {option.data && option.data.icon && (
                    <Icon
                        style={iconStyles}
                        iconName={option.data.icon}
                        aria-hidden="true"
                        title={option.data.icon}
                    />
                )}
                <span>{option.text}</span>
            </div>
        );
    };

    const onRenderTitle = (options: IDropdownOption[]): JSX.Element => {
        const option = options[0];

        return (
            <div>
                {option.data && option.data.icon && (
                    <Icon
                        style={iconStyles}
                        iconName={option.data.icon}
                        aria-hidden="true"
                        title={option.data.icon}
                    />
                )}
                <span>{option.text}</span>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Dropdown
                options={options}
                defaultSelectedKey="single"
                onRenderOption={onRenderOption}
                onRenderTitle={onRenderTitle}
                dropdownWidth="auto"
                onChange={(_ev, option) => {
                    const item = createTempItemSelectedLayout(option);
                    const existingItem = indexManager.filterFirst($eq('title', SELECTED_LAYOUT));
                    if (!existingItem) {
                        dispatchItemAdded(item.asRaw(), { temp: true });
                    } else {
                        dispatchItemUpdated(existingItem.Title, { Fields: item.Fields }, { temp: true })
                    }
                }}
            />
        </div>
    );
};
