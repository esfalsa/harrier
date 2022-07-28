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
	properties: Record<string, any>,
) {
	return Object.assign(document.createElement(tagName), properties);
}

export async function fetchNS(
	pathname: string | URL,
	searchParams:
		| string
		| string[][]
		| Record<string, any>
		| URLSearchParams = "",
	options: Record<string, any> = {},
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
	let response = await (
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

export async function doss(nation: string | Blob) {
	let data = new FormData();
	data.append("nation", nation);
	data.append("chk", chk);
	data.append("action", "add");

	fetchNS("template-overall=none/page=dossier", "", {
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		body: data,
	});
}

export async function endo(nation: string | Blob) {
	let data = new FormData();
	data.append("nation", nation);
	data.append("localid", localid);
	data.append("action", "endorse");

	fetchNS("cgi-bin/endorse.cgi", "", {
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		body: data,
	});
}

export async function move(region: string | Blob) {
	let data = new FormData();
	data.append("localid", localid);
	data.append("region_name", region);
	data.append("move_region", "1");

	fetchNS("page=change_region", "", {
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		body: data,
	});
}

export async function applyWA() {
	let data = new FormData();
	data.append("action", "join_UN");
	data.append("chk", chk);
	data.append("submit", "1");

	fetchNS("page=UN_status", "", {
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		body: data,
	});
}

export async function resignWA() {
	let data = new FormData();
	data.append("action", "leave_UN");
	data.append("chk", chk);
	data.append("submit", "1");

	fetchNS("page=UN_status", "", {
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		body: data,
	});
}

export async function clearDossier() {
	let data = new FormData();
	data.append("chk", chk);
	data.append("clear_dossier", "1");

	fetchNS("page=dossier", "", {
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		body: data,
	});
}

export async function appointRO(region: string | Blob) {
	let data = new FormData();
	data.append("page", "region_control");
	data.append("region", region);
	data.append("chk", chk);
	data.append("nation", currentNation);
	data.append("office_name", config.officerName);
	data.append("authority_A", "on");
	data.append("authority_C", "on");
	data.append("authority_E", "on");
	data.append("authority_P", "on");
	data.append("editofficer", "1");

	fetchNS(`page=region_control/region=${region}`, "", {
		method: "POST",
		headers: {
			"Content-Type": "multipart/form-data",
		},
		body: data,
	});
}

document.body.appendChild(
	createElement("div", {
		id: "toast-container",
	}),
);

export function showToast(text, styles = []) {
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
