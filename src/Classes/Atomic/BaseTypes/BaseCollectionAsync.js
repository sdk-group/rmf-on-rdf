'use strict';

var _ = require('lodash');

var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');

const default_collection_id = 'id';

class BaseCollectionAsync {
	constructor(collection_type, collection_id) {
		this.collection_type = collection_type;
		this.collection_id = collection_id || default_collection_id;

		if(this.constructor.name == 'BaseCollectionAsync') return ProxifyCollection(this);
	}
	extend(id, data) {
		this.content[id] = data;
	}

	build(items) {
		let Model = this.collection_type;

		this.content = _.reduce(items, (result, single_item, index) => {
			let obj = new Model();
			let key = single_item.key || index;
			obj.build(single_item);

			result[key] = obj;
			return result;
		}, {});
		return Promise.resolve(this);
	}
	split(size, count) {
		let Me = this.constructor;
		let current = {};
		let result = [];

		_.forEach(this.content, (item, index) => {
			if(result.length == count) return false;

			current[index] = item;

			if(_.size(current) != size) return true;

			let obj = new Me(this.collection_type, this.collection_id);
			obj.content = current;
			current = {};
			result.push(obj);
		});

		return result;
	}
	collectionMethod(method_name, passed) {
		let ids = passed[this.collection_id];
		//@TODO: rework it later with iterators
		if(ids == '*') {
			ids = _.keys(this.content);
		} else {
			if(_.isObject(ids)) {
				let from = ids.from;
				let to = ids.to;
				let prefix = ids.prefix || '';
				ids = [];
				for(let i = from; i >= to; i += 1) {
					id.push(prefix + i);
				}
			} else {
				ids = _.isArray(ids) ? ids : [ids];
			}
		}
		let Me = this.constructor;
		let result = new Me(this.collection_type, this.collection_id);
		let data = {};

		//@NOTE: generator will be here
		result.content = _.reduce(ids, (collection, id) => {

			let observe = this.content[id][method_name](passed.selection);
			if(observe) collection[id] = observe;
			return collection;
		}, {});

		return result;
	}
	serialize() {
		return _.reduce(this.content, (result, item, key) => {
			let data = item.serialize();
			data.key = key
			result[key] = data;
			return result;
		}, {})
	}
}

module.exports = BaseCollectionAsync;