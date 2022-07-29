import "./utils";

import "./styles";
import "./keybinds";
import { initializeQuickDoss, initializeQuickEndo } from "./main";
import { initialize, showToast } from "./utils";

initialize().then(() => {
	if (
		/\/page=ajax2\/a=reports\/view=region\..+\/action=.*endo.*/.test(
			location.pathname,
		)
	) {
		initializeQuickEndo();
	} else if (
		/\/page=ajax2\/a=reports\/view=region\..+\/action=.*doss.*/.test(
			location.pathname,
		)
	) {
		initializeQuickDoss();
	}
});
