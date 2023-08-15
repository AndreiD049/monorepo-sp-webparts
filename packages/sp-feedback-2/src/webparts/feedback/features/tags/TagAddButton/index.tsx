import { DirectionalHint } from '@microsoft/sp-component-base/node_modules/@fluentui/react';
import { Callout, Icon } from 'office-ui-fabric-react';
import * as React from 'react';
import { dispEvent } from '../../events';
import { TagService } from './tag-service';
import styles from './TagAddButton.module.scss';
import { TagCompletions } from './TagCompletions';
import {
    createCompletionList,
    getSelectedValue,
    selectNextOption,
    selectPrevOption,
    setOptions,
    setValue,
} from './completion-list';

export interface ITagAddButtonProps {
    feedbackId: number;
	disabled?: boolean;
}

const TagIconButton: React.FC<
    { iconName: string } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ iconName, ...props }) => {
    return (
        <button className={styles.container} title="Add tag" {...props}>
            <Icon iconName={iconName} />
        </button>
    );
};

export const TagAddButton: React.FC<ITagAddButtonProps> = (props) => {
    const input = React.useRef<HTMLInputElement>(null);
    const [isInputShown, setIsInputShown] = React.useState(false);
    const [isCalloutHidden, setIsCalloutHidden] = React.useState(true);
    const [compList, setCompList] = React.useState(
        createCompletionList([], '', true)
    );

    const clearInputValue = (): void => {
        if (!input.current) return;
        input.current.value = '';
    };

    const lockControls = (): void => {
        input.current.disabled = true;

        const parent = input.current.parentElement;
        const okButton = parent.querySelector(
            'button[data-function="add"]'
        ) as HTMLButtonElement;
        if (okButton) {
            okButton.disabled = true;
        }

        const cancelButton = parent.querySelector(
            'button[data-function="abort"]'
        ) as HTMLButtonElement;
        if (cancelButton) {
            cancelButton.disabled = true;
        }
    };

    const unlockControls = (): void => {
        input.current.disabled = false;

        const parent = input.current.parentElement;
        const okButton = parent.querySelector(
            'button[data-function="add"]'
        ) as HTMLButtonElement;
        if (okButton) {
            okButton.disabled = false;
        }

        const cancelButton = parent.querySelector(
            'button[data-function="abort"]'
        ) as HTMLButtonElement;
        if (cancelButton) {
            cancelButton.disabled = false;
        }
    };

    const showInput = (): void => {
        const parent = input.current.parentElement;
        parent.classList.remove(styles.hidden);
        parent.classList.add(styles.shown);
        setIsInputShown(true);
        unlockControls();
    };

    const hideInput = (): void => {
        const parent = input.current.parentElement;
        parent.classList.remove(styles.shown);
        parent.classList.add(styles.hidden);
        setIsInputShown(false);
        clearInputValue();
        setIsCalloutHidden(true);
    };

    const getInputValue = (): string => {
        if (!input.current) return '';
        return input.current.value;
    };

    const handleClickNew = (): void => {
        showInput();
        input.current.focus();
    };

    const handleTextChange = (ev: React.ChangeEvent): void => {
        const target = ev.target as HTMLInputElement;
        if (!target) return;

        const value = target.value;
        if (typeof value !== 'string') return;

        setCompList((prev) => setValue(prev, value));
        if (value.length >= 1 && isCalloutHidden) {
            setIsCalloutHidden(false);
        } else if (value.length === 0 && !isCalloutHidden) {
            setIsCalloutHidden(true);
        }
    };

    const updateFeedbackTags = async (value: string): Promise<void> => {
        await TagService.addTag(props.feedbackId, value);
        dispEvent('tag-add', { id: props.feedbackId, value: value });
    };

    const handleAddTag = async (): Promise<void> => {
        lockControls();
        const val = getInputValue();
        if (val !== '') {
            const selected = getSelectedValue(compList);
            await updateFeedbackTags(selected);
        }
        hideInput();
    };

    const handleClickOption = async (option: string): Promise<void> => {
        lockControls();
        await updateFeedbackTags(option);
        hideInput();
    };

    const handleKeys = async (ev: React.KeyboardEvent): Promise<void> => {
        if (ev.key === 'Enter') {
            await handleAddTag();
            return;
        }

        if (ev.key === 'ArrowDown') {
            ev.preventDefault();
            setCompList((prev) => selectNextOption(prev));
            return;
        }

        if (ev.key === 'ArrowUp') {
            ev.preventDefault();
            setCompList((prev) => selectPrevOption(prev));
            return;
        }
    };

    React.useEffect(() => {
        if (!input.current) return;

        TagService.getTagOptions()
            .then((options) => {
                setCompList((prev) => setOptions(prev, options));
            })
            .catch((err) => console.error(err));
    }, [input]);

    return (
        <>
            <div className={styles.tagInputGroup}>
                <input
                    ref={input}
                    type="text"
                    onChange={handleTextChange}
                    onKeyDown={handleKeys}
					tabIndex={isInputShown ? 0 : -1}
                />
                <TagIconButton
                    data-function="add"
                    iconName="CheckMark"
                    onClick={handleAddTag}
					tabIndex={isInputShown ? 0 : -1}
                />
                <TagIconButton
                    data-function="abort"
                    iconName="StatusCircleBlock"
                    onClick={hideInput}
					tabIndex={isInputShown ? 0 : -1}
                />
            </div>
            <TagIconButton
                iconName="Add"
                disabled={props.disabled || isInputShown}
                onClick={handleClickNew}
            />
            <Callout
                target={input}
                isBeakVisible={false}
                hidden={isCalloutHidden}
                directionalHint={DirectionalHint.bottomLeftEdge}
            >
                <TagCompletions
                    list={compList}
                    style={{ width: 200 }}
                    handleSelect={handleClickOption}
                />
            </Callout>
        </>
    );
};
