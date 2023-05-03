import { SPFI } from "sp-preset";

export const docsMap: { [key: string]: string } = {
	'docx': 'ms-word:ofe|u|',
	'doc': 'ms-word:ofe|u|',
	'xls': 'ms-excel:ofe|u|',
	'xlsx': 'ms-excel:ofe|u|',
	'ppt': 'ms-powerpoint:ofe|u|',
	'pptx': 'ms-powerpoint:ofe|u|',
}

export const docsIconMap: { [key: string]: string } = {
	'docx': 'WordDocument',
	'doc': 'WordDocument',
	'xls': 'ExcelDocument',
	'xlsx': 'ExcelDocument',
	'ppt': 'PowerPointDocument',
	'pptx': 'PowerPointDocument',
	'pdf': 'PDF',
}

// The string can contain a query parameter like ?d=w434ee72d3847413383b6d6e09b3cc64a
// or &d=w434ee72d3847413383b6d6e09b3cc64a
// this should be removed
export function sanitizeLinkingUrl(url: string | null): string {
	if (!url) return '';
	let index = url.indexOf('?d');
	if (index < 0) return url;
	return url.substring(0, index);
}

export function getDocIcon(fileName: string): string {
	const ext = getFileNameExtension(fileName);
	return docsIconMap[ext] || 'Document';
}

export function getFileNameExtension(fileName: string): string {
	if (!fileName) return '';
	const tokens = fileName.split('.');
	return tokens[tokens.length - 1];
};

export function isDocLink(fileName: string): boolean {
	const ext = getFileNameExtension(fileName);
	return Boolean(docsMap[ext]);
}

export function getUrlPrefix(sp: SPFI) {
	const url = sp.site.toUrl();
	return url.replace('_api/site', '');
}
