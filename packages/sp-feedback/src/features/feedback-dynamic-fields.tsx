/**
 * This feature should help diplay fields dynamically when user inserts a new feedback.
 * All starts with an Application selection.
 * The application item has a 'fields' property that represents a dictionary
 * of all additional fields that this application should display.
 * Field values are looked up in the 'FB:/FIELD_VALUES' item. If nulls are not allowed, the field becomes
 * required.
 *
 * We will need a new item type, 'FB:/FORM_FIELD_SETUP' that holds the setup for how the field
 * is displayed in the input form. It can have following values:
 * - icon: Icon to display near the input
 * - type: textfield | dropdown | choice – how the item will get displayed
 * - label: the label to show in the new form
 * - fields: see below
 *
 * Example of 'fields' property:
 * 'fields': {
 *      'default': [ 'environment', 'category' ],
 *      'APP 2.0': ['role']
 * }
 *
 * It means that when this property is in effect, by default it will also show 'environment'
 * and 'category' fields. And only if current field has value 'APP 2.0', then it will *also* show
 * the 'role' field.
 */

import { IFields } from '../models/IFeedbackItem';
import { FORM_FIELD_SETUP } from '../webparts/feedback/constants';
import { $and, $eq } from '../webparts/feedback/indexes/filter';
import { IndexManager } from '../webparts/feedback/indexes/index-manager';

export type FormFieldSetupType = {
    field: string;
    icon: string;
    type: 'textfield' | 'dropdown' | 'choice';
    label: string;
    additionalFields: {
        [key: string]: string[];
    };
};

const defaultFormFieldSetup: FormFieldSetupType = {
    field: null,
    icon: null,
    type: 'textfield',
    label: null,
    additionalFields: {
        default: [],
    },
};

function readFormFieldSetupFromFields(fields: IFields): FormFieldSetupType {
    return { ...defaultFormFieldSetup, ...fields };
}

export function getAllFormFieldSetups(
    indexManager: IndexManager
): FormFieldSetupType[] {
    return indexManager
        .filterArray($eq('tag', FORM_FIELD_SETUP))
        .map((i) => readFormFieldSetupFromFields(i.Fields));
}

export function getFormFieldSetup(
    field: string,
    indexManager: IndexManager
): FormFieldSetupType {
    const fieldSetup = indexManager.filterFirst(
        $and($eq('tag', FORM_FIELD_SETUP), $eq('field', field)),
    );
    if (!fieldSetup) return null;
    return readFormFieldSetupFromFields(fieldSetup.Fields);
}

export function getRelatedFieldSetups(currentFieldSetup: FormFieldSetupType, value: string, indexManager: IndexManager): FormFieldSetupType[] {
    let additionalFields = currentFieldSetup.additionalFields.default;
    if (value in currentFieldSetup.additionalFields) {
        additionalFields = currentFieldSetup.additionalFields[value];
    }
    if (!additionalFields) return [];
    return additionalFields.map((f) => getFormFieldSetup(f, indexManager)).filter((s) => s !== null);
}
