import { Dropdown, Icon, IDropdownOption } from 'office-ui-fabric-react';
import * as React from 'react';
import { SELECTED_VIEW } from '../../constants';
import { dispatchItemAdded, dispatchItemUpdated } from '../../services/events';
import {
    changeLayout,
    getEmptySelectedView,
    getViewInfo,
} from '../../services/saved-view';
import { GlobalContext } from '../Feedback';
import styles from './LayoutSelect.module.scss';

export interface ILayoutSelectProps {
    // Props go here
}

export const SINGLE_COL = 'single';
export const DOUBLE_COL = 'double';
export const TRIPLE_COL = 'triple';
export const BOARD = 'board';

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
    {
        key: BOARD,
        text: 'Board',
        data: {
            icon: 'BacklogBoard',
        },
    },
];
const iconStyles = { marginRight: '8px' };

export const LayoutSelect: React.FC<ILayoutSelectProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const viewInfo = React.useMemo(
        () => getViewInfo(indexManager),
        [indexManager]
    );
    const selected = React.useMemo(
        () => viewInfo.appliedLayout,
        [indexManager]
    );

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
                onRenderOption={onRenderOption}
                onRenderTitle={onRenderTitle}
                dropdownWidth="auto"
                selectedKey={selected}
                onChange={(_ev, option) => {
                    const options = { temp: true, persist: true };
                    if (!viewInfo.tempItem) {
                        dispatchItemAdded(
                            changeLayout(
                                getEmptySelectedView(),
                                option.key as string
                            ).asRaw(),
                            options
                        );
                    } else {
                        dispatchItemUpdated(
                            SELECTED_VIEW,
                            changeLayout(viewInfo.tempItem, option.key as string).Fields,
                            options
                        );
                    }
                }}
            />
        </div>
    );
};
