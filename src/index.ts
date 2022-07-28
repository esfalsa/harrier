import "./utils";

import "./styles";
import "./keybinds";
import { showLoadTime, quickDoss, quickEndo } from "./main";
import { initialize, showToast } from "./utils";

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

	showLoadTime();
});
