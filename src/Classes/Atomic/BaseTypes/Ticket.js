'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Ticket extends DatabaseFieldset {
	static get fields() {
		return ["initial_time_description", "pack_member", "inheritance_counter", "inherits", "inheritance_level", 'session', 'locked_fields', 'booking_method', 'source', "qa_answers", 'time_description', 'operator', 'alt_operator', 'history', 'service', "code", "destination", 'org_destination', "booking_date", "dedicated_date", "priority", "state", "user_info", "user_info_description", "service_count", "called", "expiry"];
	}

	build(data) {
		super.build(data);
		if (_.isString(this.content_map.service_count))
			this.content_map.service_count = _.parseInt(this.content_map.service_count);
	}

	static buildSerialized(data) {
		let serialized = super.buildSerialized(data);
		if (_.isString(serialized.service_count))
			serialized.service_count = _.parseInt(serialized.service_count);
		return serialized;
	}

	static get references() {
		return ["inherits", 'session', 'service', 'operator', 'alt_operator', 'destination', 'org_destination', 'source'];
	}

	static buildQuery(data) {
		let today = data.today;
		let db_data = super.buildQuery(data);
		db_data.today = today;
		return db_data;
	}

}

module.exports = Ticket;