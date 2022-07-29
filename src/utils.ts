import config from "./config";

export let currentNation: string, localid: string;
export let chk: string, dossed: string[];

export async function initialize() {
	[[currentNation, localid], [chk, dossed]] = await Promise.all([
		getLocalId(),
		getChkDoss(),
	]);
}

export function createElement(
	tagName: string,
	properties: Record<string, string>,
) {
	return Object.assign(document.createElement(tagName), properties);
}

export async function fetchNS(
	pathname: string | URL,
	searchParams:
		| string
		| string[][]
		| Record<string, string>
		| URLSearchParams = "",
	options: RequestInit = {},
) {
	const search = new URLSearchParams(searchParams);
	search.append("user-agent", config.userAgent);

	const resource = Object.assign(
		new URL(pathname, "https://www.nationstates.net"),
		{
			search: search,
		},
	);

	options.headers = { ...options.headers, "User-Agent": config.userAgent };
	options.redirect = "manual";

	return fetch(resource, options);
}

export async function postNS(
	endpoint: string | URL,
	data: Record<string, string>,
) {
	const payload = new FormData();

	for (const [key, value] of Object.entries(data)) {
		payload.append(key, value);
	}

	return fetchNS(endpoint, "", {
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		body: payload,
	});
}

/* REQUESTS */
export async function getChkDoss(): Promise<[string, string[]]> {
	const response = await (
		await fetchNS("template-overall=none/page=dossier")
	).text();

	const chk = response.match(
		/<input type="hidden" name="chk" value="(?<chk>.+)">/,
	).groups.chk;

	const dossed = [
		...response.matchAll(
			/<input type="checkbox" name="remove_nation_(?<nation>.+?)">/g,
		),
	].map((match) => match.groups.nation);

	return [chk, dossed];
}

export async function getLocalId() {
	const response = await (
		await fetchNS("template-overall=none/page=create_region")
	).text();

	return [
		response.match(/<a href="nation=(?<nation>.+)" class="nlink">/).groups
			.nation,
		response.match(
			/<input type="hidden" name="localid" value="(?<localid>.+)">/,
		).groups.localid,
	];
}

export async function doss(nation: string) {
	await postNS("template-overall=none/page=dossier", {
		nation: nation,
		chk: chk,
		action: "add",
	});
}

export async function endo(nation: string) {
	await postNS("cgi-bin/endorse.cgi", {
		nation: nation,
		localid: localid,
		action: "endorse",
	});
}

export async function move(region: string) {
	await postNS("template-overall=none/page=change_region", {
		localid: localid,
		region_name: region,
		move_region: "1",
	});
}

export async function applyWA() {
	await postNS("template-overall=none/page=UN_status", {
		action: "join_UN",
		chk: chk,
		submit: "1",
	});
}

export async function resignWA() {
	await postNS("template-overall=none/page=UN_status", {
		action: "leave_UN",
		chk: chk,
		submit: "1",
	});
}

export async function clearDossier() {
	await postNS("template-overall=none/page=dossier", {
		chk: chk,
		clear_dossier: "1",
	});
}

export async function appointRO(region: string) {
	await postNS(`page=region_control/region=${region}`, {
		page: "region_control",
		region: region,
		chk: chk,
		nation: currentNation,
		office_name: config.officerName,
		authority_A: "on",
		authority_C: "on",
		authority_E: "on",
		authority_P: "on",
		editofficer: "1",
	});
}

document.body.appendChild(
	createElement("div", {
		id: "toast-container",
	}),
);

export function showToast(text: string, styles: string[] = []) {
	const toast = createElement("div", {
		textContent: text,
		className: ["toast", ...styles].join(" "),
	});
	toast.style.maxHeight = "0";
	toast.style.paddingTop = "0";
	toast.style.paddingBottom = "0";
	toast.style.opacity = "0";
	toast.style.marginBottom = "0";

	document.querySelector("#toast-container").prepend(toast);
	setTimeout(() => {
		toast.removeAttribute("style");
	}, 100);

	setTimeout(() => {
		toast.style.opacity = "0";
		setTimeout(() => {
			toast.remove();
		}, 1500);
	}, 1500);
}
