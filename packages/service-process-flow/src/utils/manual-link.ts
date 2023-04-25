import { SPFI } from "sp-preset";

function getLinksFromManualString(link: string): string[] {
	return link.split('\n').map((man) => man.split('\t')[1]).filter((link) => Boolean(link));
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
	const links = getLinksFromManualString(link);
	const prefix = getUrlPrefix(sp);
	const ids = await Promise.all(links.map(async (l) => getFileId(sp, l)));
	return replaceLinksInManualString(
		link, 
		ids.map((i) => joinPrefixWithId(prefix, i))
	);
}
