/* UTILITIES */
function createElement(tagName: string, properties: Record<string, any>) {
	return Object.assign(document.createElement(tagName), properties);
}

async function fetchNS(
	pathname: string | URL,
	searchParams:
		| string
		| string[][]
		| Record<string, any>
		| URLSearchParams = "",
	options: Record<string, any> = {},
) {
	let resource = Object.assign(
		new URL(pathname, "https://www.nationstates.net"),
		{
			search: new URLSearchParams(searchParams),
		},
	);

	options.headers = { ...options.headers, "User-Agent": config.userAgent };
	options.redirect = "manual";

	return fetch(resource, options);
}

/* VARIABLES */
let currentNation, localid;
let chk, dossed;

let disableKeybinds = false;

async function initialize() {
	[[currentNation, localid], [chk, dossed]] = await Promise.all([
		getLocalId(),
		getChkDoss(),
	]);
}

/* INITIALIZATION */
initialize().then(() => {
	if (
		/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(
			location.pathname,
		)
	) {
		quickEndo();
	} else if (
		/\/page=ajax2\/a=reports\/view=region\..+\/action=.*doss.*/.test(
			location.pathname,
		)
	) {
		quickDoss();
	}
});

/* QUICK ENDO */
async function quickEndo() {
	let happenings = document.querySelectorAll("li[id^='happening-']");

	happenings.forEach((happening) => {
		if (
			happening.textContent.includes("was admitted to the World Assembly") ||
			happening.textContent.includes("endorsed")
		) {
			let nation = happening
				.querySelector(".nnameblock")
				.textContent.toLowerCase()
				.replaceAll(" ", "_");

			if (nation !== currentNation) {
				let button = createElement("button", {
					textContent: "Endo",
					id: nation,
				});
				button.dataset.action = "endorse";
				happening.querySelector(".nlink").after(button);
				button.addEventListener("click", () => {
					document
						.querySelectorAll("button")
						.forEach((button) => (button.disabled = true));

					endo(nation).then(() => {
						document
							.querySelectorAll(`[id="${nation}"]`)
							.forEach((button) => button.classList.add("endorsed"));
						document
							.querySelectorAll("button:not(.endorsed)")
							.forEach(
								(button: HTMLButtonElement) => (button.disabled = false),
							);
					});
				});
			}
		}
	});
}

/* QUICK DOSS */
async function quickDoss() {
	document.querySelectorAll("a.nlink").forEach((link) => {
		let nation = link
			.querySelector(".nnameblock")
			.textContent.toLowerCase()
			.replaceAll(" ", "_");
		let button = createElement("button", {
			textContent: "Doss",
			id: nation,
			disabled: dossed.includes(nation),
		});
		button.dataset.action = "doss";
		if (dossed.includes(nation)) {
			button.classList.add("dossed");
		}
		link.after(button);
		button.addEventListener("click", () => {
			document
				.querySelectorAll("button")
				.forEach((button) => (button.disabled = true));

			doss(nation).then(() => {
				document
					.querySelectorAll(`[id="${nation}"]`)
					.forEach((button) => button.classList.add("dossed"));
				document
					.querySelectorAll("button:not(.dossed)")
					.forEach((button: HTMLButtonElement) => (button.disabled = false));
			});
		});
	});
}

/* REPORTS LOAD TIME */
if (location.pathname.includes("page=reports")) {
	function timePerformance() {
		const duration = performance.getEntriesByType("navigation")[0].duration;
		if (!duration) {
			setTimeout(timePerformance, 0);
		} else {
			document.querySelector("h1").textContent += ` (${duration.toFixed(1)}ms)`;
		}
	}
	timePerformance();
}

/* REPLACE AJAX2 LINKS */
if (location.pathname.includes("page=ajax2")) {
	document
		.querySelectorAll("a.rlink, a.nlink")
		.forEach((link: HTMLAnchorElement) => {
			link.href = `/template-overall=none/${link.getAttribute("href")}`;
		});
}

/* REQUESTS */
async function getChkDoss(): Promise<[string, string[]]> {
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

async function getLocalId() {
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

async function doss(nation: string | Blob) {
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

async function endo(nation: string | Blob) {
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

async function move(region: string | Blob) {
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

async function applyWA() {
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

async function resignWA() {
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

async function clearDossier() {
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

async function appointRO(region: string | Blob) {
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
