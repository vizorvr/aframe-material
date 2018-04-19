const Utils = require('../utils');
const Event = require('../core/event');

AFRAME.registerComponent('form', {
  schema: {},
  init: function () {},
});

AFRAME.registerPrimitive('a-form', {
  defaultComponents: {
    form: {}
  },
  mappings: {}
});
