'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Organization extends DatabaseFieldset {
	static get fields() {
		return ["okato", "pin_code_prefix", "provides", "has_schedule", "has_unit", "unit_of", "org_timezone",
			"booking_methods", "live_autopostpone", "live_autorestore", "live_autopostpone_count",
			"prebook_expiration_interval",
			"prebook_show_interval",
			"prebook_label_prefix",
			"prebook_observe_offset",
			"prebook_register_interval",
			"prebook_separation_interval",
			"error_dialog_duration",
			"formatted_address",
			"mkgu_code",
			"qa_enabled",
			"ignore_agent_state",
			"auto_logout_time",
			"auto_warmup_time",
			"auto_expire_time",
			"available_slots_offset",
			"workstation_resource_enabled", "employee_resource_enabled",
			"workstation_filtering_enabled", "employee_filtering_enabled", "notification_levels",
			"sound_theme", "max_slots_per_day",
			"live_priority_ordering",
			"separate_prebook_ordering", "frontend_cache"
		];

	}

	static get references() {
		return ["provides", "has_schedule", "has_unit", "unit_of"];
	}
}

module.exports = Organization;
