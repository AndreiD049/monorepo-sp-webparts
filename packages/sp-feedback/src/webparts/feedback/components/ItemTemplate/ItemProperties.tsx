import { ActionButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { NULL } from '../../constants';
import { $eq } from '../../indexes/filter';
import { Item } from '../../item';
import { GlobalContext } from '../Feedback';
import {
    hideListOptionsCallout,
    makeSimpleListOption,
    showListOptionsCallout,
} from '../OptionList';
import styles from './ItemTemplate.module.scss';

export const ItemProperties: React.FC<{
    properties: [string, string | number][];
}> = (props) => {
    return (
        <div style={{ marginBottom: '.5em' }}>
            <table className={styles.propTable}>
                <tbody>
                    {props.properties.map(([key, value]) => (
                        <tr key={key}>
                            <td
                                className={
                                    value === undefined ? styles.deleted : ''
                                }
                            >
                                {key}
                            </td>
                            <td
                                className={
                                    value === undefined ? styles.deleted : ''
                                }
                            >
                                {value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ItemPropertiesEditable: React.FC<{
    properties: [string, string | number][];
    item: Item;
    setItem: React.Dispatch<React.SetStateAction<Item>>;
}> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);

    const handleClickValue = React.useCallback(
        (element: HTMLElement, field: string) => {
            const values = indexManager.getValues(field);
            showListOptionsCallout(element, {
                options: values.map((v) => makeSimpleListOption(v)),
                allowNewVlaues: true,
                onSelect: (opt) => {
                    if (opt.key === NULL) {
                        props.setItem((prev) => prev.unsetField(field));
                    } else {
                        props.setItem((prev) => prev.setField(field, opt.key));
                    }
                    hideListOptionsCallout();
                },
            });
        },
        [props.item, props.setItem, indexManager]
    );

    const handleClickNewField = React.useCallback(
        (element: HTMLButtonElement) => {
            const fields = indexManager.getFields($eq('isservice', 'false'));
            showListOptionsCallout(element, {
                options: fields.map((f) => makeSimpleListOption(f)),
                allowNewVlaues: true,
                onSelect: (opt) => {
                    props.setItem((prev) => prev.setField(opt.key.toString(), null));
                    hideListOptionsCallout();
                }
            });
        },
        [props.item, props.setItem, indexManager]
    );

    return (
        <div style={{ marginBottom: '.5em' }}>
            <table className={styles.propTable}>
                <tbody>
                    {props.properties.map(([key, value]) => (
                        <tr key={key}>
                            <td
                                className={
                                    value === undefined ? styles.deleted : ''
                                }
                            >
                                {key}
                            </td>
                            <td
                                className={
                                    value === undefined ? styles.deleted : ''
                                }
                            >
                                <button
                                    onClick={(ev) =>
                                        handleClickValue(ev.currentTarget, key)
                                    }
                                >
                                    {value}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ActionButton
                onClick={(ev) =>
                    handleClickNewField(ev.currentTarget as HTMLButtonElement)
                }
                iconProps={{ iconName: 'Add' }}
                className={styles.propTableNewFieldButton}
            >
                Add field
            </ActionButton>
        </div>
    );
};
