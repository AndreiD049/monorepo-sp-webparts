import { isNumber } from "lodash";

export function formatDate(date: Date): string {
  if (!date) return null;
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${date.getFullYear()}-${month}-${day}`;
}

export function encodeXML(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function decodeXML(text: string): string {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

export function getPermittedYearsPerSite(site: string): number {
	const permitYearsPerSite: { [key: string]: number } = {
		"JLT": 5,
	}
	if (permitYearsPerSite[site] && isNumber(permitYearsPerSite[site])) {
		return permitYearsPerSite[site]
	}
	return 3;
}
