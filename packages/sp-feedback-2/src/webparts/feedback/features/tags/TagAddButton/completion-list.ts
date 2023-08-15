export interface CompletionList {
    options: string[];
    filteredOptions: string[];
    value: string;
    selectedIdx: number;
	allowCustomValues: boolean;
}

export function createCompletionList(
    options: string[],
    value: string,
	allowCustomValues: boolean = false,
): CompletionList {
    const result: CompletionList = {
        options,
        filteredOptions: [],
        value,
        selectedIdx: 0,
		allowCustomValues,
    };

    return setValue(result, value);
}

export function setValue(list: CompletionList, value: string): CompletionList {
    const result = { ...list, value };
    result.filteredOptions = getFilteredOptions(result.options, result.value);
    if (result.filteredOptions.length <= result.selectedIdx) {
        result.selectedIdx = 0;
    }

    return result;
}

export function setOptions(list: CompletionList, options: string[]): CompletionList {
	const result = { ...list, options, };

	return setValue(result, result.value);
}

export function getFilteredOptions(options: string[], value: string): string[] {
    const searchValue = value.toLowerCase();

    return options.filter((o) => {
        const val = o.toLowerCase();
        return val.indexOf(searchValue) > -1;
    });
}

export function selectNextOption(list: CompletionList): CompletionList {
    const result: CompletionList = { ...list };

    const nextIdx = result.selectedIdx + 1;
    if (nextIdx > result.filteredOptions.length) {
        return result;
    }

    if (!isNewValue(result)) {
        return result;
    }

	// If no custom values are allowed
	if (!result.allowCustomValues && nextIdx === result.filteredOptions.length) {
		return result;
	}

    result.selectedIdx = nextIdx;
    return result;
}

export function selectPrevOption(list: CompletionList): CompletionList {
    const result = { ...list };

    const prevIdx = result.selectedIdx - 1;
    if (prevIdx < 0) {
        return result;
    }

    result.selectedIdx = prevIdx;
    return result;
}

export function getSelectedValue(list: CompletionList): string {
	if (isNewValueSelected(list)) return list.value;
    if (!isIdxWithinRange(list)) return null;

    return list.filteredOptions[list.selectedIdx];
}

export function isNewValueSelected(list: CompletionList): boolean {
    return list.selectedIdx === list.filteredOptions.length;
}

function isIdxWithinRange(list: CompletionList): boolean {
    const idx = list.selectedIdx;
    const optionsLength = list.filteredOptions.length;

    if (idx >= 0 && idx < optionsLength) {
        return true;
    }
    return false;
}

export function isNewValue(list: CompletionList): boolean {
    const o = list.value.toLowerCase();

    for (let i = 0; i < list.filteredOptions.length; ++i) {
        const fo = list.filteredOptions[i];
        if (o === fo) return false;
    }

    return true;
}

export function isIdxSelected(list: CompletionList, idx: number): boolean {
    return list.selectedIdx === idx;
}
