'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQ", query);
		if (!query)
			return {};
		if (query.operator_id == '*') {} else {
			let op_keys = _.castArray(query.operator_id);
		}
		let chain = [];
		let s_in_keys;
		let o_in_keys;
		let s_out_keys;
		let o_out_keys;
		let m_key = "global_membership_description";
		if (query.operator == '*') {
			chain.push({
				name: "mm",
				in_keys: [m_key]
			});
			o_out_keys = (md) => {
				let ops = _.map(_.filter(md[m_key].value.has_description, (mm) => (mm.role == "Operator" && mm.organization == query.organization)), "member");
				return _.concat(_.uniq(_.flattenDeep(ops)), query.service_keys);
			};
		} else {
			o_in_keys = _.concat(_.uniq(_.castArray(query.operator)), query.service_keys);
		}
		chain.push({
			name: "ops",
			in_keys: o_in_keys,
			out_keys: o_out_keys
		});
		if (query.service == '*') {
			s_out_keys = (ops) => {
				let mask = ops[query.service_keys] || [];
				_.unset(ops, query.service_keys);
				return _.intersection(_.flatMap(ops, "value.provides"), mask.value.content);
			};
		} else {
			s_in_keys = _.castArray(query.service);
		}
		chain.push({
			name: "services",
			in_keys: s_in_keys,
			out_keys: s_out_keys
		});
		chain.push({
			name: "schedules",
			out_keys: (servs) => {
				let schedules = _.map(servs, `value.has_schedule.${query.method}`);
				return _.uniq(_.flattenDeep(schedules));
			}
		});
		let req = {
			type: 'chain',
			key_depth: 2,
			query: chain,
			final: function (res) {
				let services = _.keyBy(_.map(res.services, "value"), "@id");
				let ops = _.keyBy(_.map(res.ops, "value"), "@id");
				let schedules = _.keyBy(_.map(res.schedules, "value"), "@id");
				let reduced = _.reduce(ops, (acc, val, key) => {
					acc[key] = _.reduce(val.provides, (s_acc, s_id) => {
						let sch = _.find(schedules, (sch, sch_id) => {
							// console.log("SCH", sch_id, services[s_id], s_id, key);
							return services[s_id] && !!~_.indexOf(_.castArray(services[s_id].has_schedule[query.method]), sch_id) && !!~_.indexOf(sch.has_day, query.day);
						});
						if (sch)
							s_acc[s_id] = sch;
						return s_acc;
					}, {});
					return acc;
				}, {});
				// console.log("REDUCED SPLANS", reduced);
				return reduced;
			}
		};

		return {
			query: req
		};
	}
};
