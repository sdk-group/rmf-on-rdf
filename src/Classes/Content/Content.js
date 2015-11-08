'use strict'

var _ = require('lodash');


var ResolvedContent = require('./ResolvedContent.js');
var Path = require('./Path/Path.js');

class Content {
  constructor() {
    this.content_map = {
      '<namespace>content': null,
      '<namespace>attribute': null
    };
    this.path = new Path(this.content_map);

    //@NOTE: this hack is very dirty and ugly
    //@TODO: do something, pls
    this.path.selector().resolve = this.resolve.bind(this);

    this.is_editable = true;
  }
  addAtom(atom, atom_uri, ...path) {
    path = path.length ? path : ['<namespace>content'];
    path.push(atom_uri);

    if (_.has(this.content_map, path)) throw new Error("This path is used already");

    _.set(this.content_map, path, atom);

    return this;
  }

  //@TODO: rework it
  set editable(value) {
    this.is_editable = value;
  }
  isEditable() {
    return this.is_editable;
  }
  resolve(params) {
    var resolved = new ResolvedContent(this);

    for (var atom_data of this.path) {
      var {
        atom_path: atom_path,
        atom: atom
      } = atom_data;

      resolved.addAtom(atom_path, atom.resolve(params));
    }

    return resolved;
  }
  save(data) {
    return _.map(data, (item, index) => {
      //@TODO: need some cheks here
      if (_.isEmpty(item)) return true;

      var {
        content: content,
        path: path
      } = item;

      if (!path || !content) return false;

      var atom = this.getAtom(path);

      return content instanceof atom.Model ? atom.save(content) : false;
    });
  }
  getAtom(path) {
    return _.get(this.content_map, path);
  }
}

module.exports = Content;