'use strict'

let base_dir = "../../../";

let CommonApi = require("./CommonApi");

let default_user_info_fields = 'user_info_fields';
let default_service_ids_cache = 'service_ids_cache';

class ServiceApi extends CommonApi {
	constructor(cfg = {}) {
		super();
		let config = _.merge({
			user_info_fields: default_user_info_fields,
			service_ids_cache: default_service_ids_cache
		}, cfg);
		this.user_info_fields = config.user_info_fields;
		this.service_ids_cache = config.service_ids_cache;
	}


	initContent() {
		super.initContent('Service');
		super.initContent('ServiceGroup');
		return this;
	}

	getUserInfoFields() {
		return this.db.get(this.user_info_fields)
			.then((res) => (_.pickBy(res.value, (val, key) => !_.startsWith(key, "@")) || {}))
			.catch((err) => {});
	}

	cacheServiceIds() {
		return this.db.N1ql.direct({
				query: `SELECT  \`@id\` FROM ${this.db.bucket_name} WHERE  \`@type\`='Service'`
			})
			.then((res) => {
				return this.db.upsert(this.service_ids_cache, {
					"@id": "ServiceCache",
					"@type": "Cache",
					"content": _.map(res, '@id')
				});
			});
	}

	getServiceTree(query) {
		let groups = {};
		let services = {};
		let direct = this.content['ServiceGroup'].accessor;
		let unroll = (keys) => {
			return direct.get({
					keys
				})
				.then((res) => {
					return Promise.props(_.mapValues(res, (val, key) => {
						if (!val)
							return Promise.resolve({});
						let type = val.value['@type'];
						let Model = this.models[type];
						let item = new Model();
						item.build(val);
						let data = item.serialize();
						if (type === "ServiceGroup") {
							groups[key] = data;
							return unroll(data.content);
						}
						services[key] = data;
						return Promise.resolve(data);
					}));
				});
		}
		return this.getServiceGroup(query)
			.then((res) => {
				return unroll(_.keys(res))
					.then((res) => {
						let nested = _.map(groups, (val, key) => {
							let cnt = _.castArray(val.content);
							cnt = _.map(cnt, (key) => {
								return groups[key] || services[key];
							});
							return _.merge({}, val, {
								content: cnt
							});
						});
						let ordered = _.mapValues(_.groupBy(nested, 'view_name'), (val) => {
							return _.keyBy(val, (item) => {
								return (item.view_order == "0" || _.size(val) == 1) ? 'root' : item.id;
							});
						});
						// console.log("ORDERED", require('util').inspect(ordered, {
						// 	depth: null
						// }));
						return ordered;
					});
			});
	}

	getService(query) {
		return super.getEntry('Service', query);
	}

	setServiceField(query, assignment) {
		return super.setEntryField('Service', query, assignment);
	}

	setService(data) {
		return super.setEntry('Service', data);
	}

	getServiceGroup(query) {
		return super.getEntry('ServiceGroup', query);
	}
	setServiceGroupField(query, assignment) {
		return super.setEntryField('ServiceGroup', query, assignment);
	}

	setServiceGroup(data) {
		return super.setEntry('ServiceGroup', data);
	}
}

module.exports = ServiceApi;
