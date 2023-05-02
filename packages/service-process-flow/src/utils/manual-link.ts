import { SPFI } from "sp-preset";

export const docsMap: { [key: string]: boolean } = {
	'docx': true,
	'doc': true,
	'xls': true,
	'xlsx': true,
	'ppt': true,
	'pptx': true,
}

export function getFileNameExtension(fileName: string): string {
	const tokens = fileName.split('.');
	return tokens[tokens.length - 1];
};

export function isDocLink(fileName: string): boolean {
	const ext = getFileNameExtension(fileName);
	return docsMap[ext];
}

function getUrlPrefix(sp: SPFI) {
	const url = sp.site.toUrl();
	return url.replace('_api/site', '');
}

async function getFileId(sp: SPFI, link: string): Promise<string> {
	const fileInfo = await sp.web.getFileByUrl(link)();
	if (!fileInfo.Name.endsWith('.docx') && !fileInfo.Name.endsWith('.doc')) {
		return '';
	}
	return fileInfo.UniqueId;
}

function joinPrefixWithId(prefix: string, id: string): string {
	if (!id) return '';
	return `${prefix}_layouts/15/Doc.aspx?sourcedoc={${id}}`;
}

function replaceLinksInManualString(initial: string, links: string[]): string {
	const lines = initial.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const tokens = lines[i].split('\t');
		if (links[i] && links[i].length > 0) {
			tokens[1] = links[i];
		}
		lines[i] = tokens.join('\t');
	}
	return lines.join('\n');
}

export async function processManualLink(sp: SPFI, link: string): Promise<string> {
	const prefix = getUrlPrefix(sp);
	const ids = await Promise.all([].map(async (l) => getFileId(sp, l)));
	return replaceLinksInManualString(
		link, 
		ids.map((i) => joinPrefixWithId(prefix, i))
	);
}
