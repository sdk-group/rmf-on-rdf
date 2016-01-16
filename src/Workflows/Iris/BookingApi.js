'use_strict'

let IrisBuilder = require("./Builder");
let IrisApi = require("./IrisApi");

//temporary here
//@TODO make all this bullshit in a righteous way
class BookingApi extends IrisApi {
	constructor() {
		super();
	}
	initContent() {
		IrisBuilder.init(this.db, {
			default_slot_size: 15 * 3600
		});
		let rs = IrisBuilder.getResourceSource();
		this.factory = IrisBuilder.getFactory({
			'ldplan': rs
		});
	}

	getContent() {
		return this.factory;
	}

	build(query, factory_params = {}) {
		this.factory.selector().reset()
			.add()
			.id('<namespace>builder').id('box').query(query);
		return this.factory.build(factory_params);
	}

	observe(query, factory_params = {}) {
		return this.build(query, factory_params)
			.then((produced) => {
				return produced.observe({
					box_id: query.box_id || '*'
				});
			})
			.then((res) => {
				return res.getAtom(['<namespace>builder', 'box']).serialize();
			});
	}

	reserve(data) {
		data.reserve = true;
		return this.factory.getAtom(['<namespace>builder', 'box']).save(data);
	}

	confirm(data) {
		data.reserve = false;
		return this.factory.getAtom(['<namespace>builder', 'box']).save(data);
	}

}
module.exports = BookingApi;