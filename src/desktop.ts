/* KEYBINDS */
document.addEventListener("keydown", (event) => {
	if (event.key === " " && event.target === document.body) {
		event.preventDefault();
		event.stopPropagation();
	}
});

document.addEventListener("keyup", (event) => {
	if (disableKeybinds) {
		return;
	}

	const target = event.target as HTMLElement;
	if (
		target.tagName == "INPUT" ||
		target.tagName == "SELECT" ||
		target.tagName == "TEXTAREA" ||
		target.isContentEditable
	) {
		return;
	}

	switch (event.key) {
		case config.keybinds.reports:
			location.assign(
				location.pathname.includes("page=reports")
					? "https://www.nationstates.net/page=ajax2/a=reports/view=world/filter=move+member+endo"
					: "https://www.nationstates.net/template-overall=none/page=reports",
			);
			break;

		case config.keybinds.updated:
			location.assign(
				"https://www.nationstates.net/page=ajax2/a=reports/view=self/filter=change",
			);
			break;

		case config.keybinds.toggle:
			if (location.pathname.includes("template-overall=none")) {
				location.replace(
					location.href.replaceAll("/template-overall=none", ""),
				);
			} else {
				location.replace(
					`/template-overall=none${location.pathname}${location.search}${location.hash}`,
				);
			}
			break;

		case config.keybinds.moveJP:
			disableKeybinds = true;
			move(config.jumpPoint.toLowerCase().replaceAll(" ", "_")).then(() => {
				disableKeybinds = false;
				alert(`Moved back to ${config.jumpPoint}.`);
			});
			break;

		case config.keybinds.move:
			if (location.pathname.includes("/region=")) {
				(
					document.querySelector(
						"button[name=move_region]",
					) as HTMLButtonElement
				).click();
			} else {
				let region = document.querySelector("li a:nth-of-type(3)").textContent;
				disableKeybinds = true;
				move(region.toLowerCase().replaceAll(" ", "_")).then(() => {
					disableKeybinds = false;
					alert(`Moved to ${region}`);
				});
			}
			break;

		case config.keybinds.endorse:
			if (location.pathname.includes("/nation=")) {
				(document.querySelector("button.endorse") as HTMLButtonElement).click();
			} else {
				(
					document.querySelector(
						"button[data-action=endorse]:not([disabled])",
					) as HTMLButtonElement
				).click();
			}
			break;

		case config.keybinds.doss:
			if (location.pathname.includes("/nation=")) {
				(
					document.querySelector(
						"button[name=action][value=add]",
					) as HTMLButtonElement
				).click();
			} else {
				(
					document.querySelector(
						"button[data-action=doss]:not([disabled])",
					) as HTMLButtonElement
				).click();
			}
			break;

		case config.keybinds.viewDossier:
			location.assign("/template-overall=none/page=dossier");
			break;

		case config.keybinds.clearDossier:
			disableKeybinds = true;
			clearDossier().then(() => {
				disableKeybinds = false;
				dossed = [];
				document
					.querySelectorAll("button.dossed")
					.forEach((button: HTMLButtonElement) => {
						button.disabled = false;
						button.classList.remove("dossed");
					});
				alert("Cleared dossier.");
			});
			break;

		case config.keybinds.appointRO:
			if (location.pathname.includes("/region=")) {
				const region = location.pathname.match(/\/region=(?<region>.*)\/?/)
					.groups.region;
				disableKeybinds = true;
				appointRO(region).then(() => {
					disableKeybinds = false;
					alert(`Appointed ${currentNation} as RO in ${region}`);
				});
			}
			break;

		case config.keybinds.apply:
			disableKeybinds = true;
			applyWA().then(() => {
				disableKeybinds = false;
				alert("Applied to the World Assembly.");
			});
			break;

		case config.keybinds.resign:
			disableKeybinds = true;
			resignWA().then(() => {
				disableKeybinds = false;
				alert("Resigned from the World Assembly.");
			});
			break;

		case config.keybinds.joinWA:
			(
				document.querySelector(
					"form[action='/cgi-bin/join_un.cgi'] button[type='submit']",
				) as HTMLButtonElement
			).click();
			break;

		case config.keybinds.reload:
			disableKeybinds = true;
			location.reload();
			break;
		case config.keybinds.back:
			history.back();
			break;
		case config.keybinds.forward:
			history.forward();
			break;
	}
});
