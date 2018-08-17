"use strict";

exports.__esModule = true;

var _chainHandleReturn = require("./chainHandleReturn");

var _chainHandleReturn2 = _interopRequireDefault(_chainHandleReturn);

var _chainBlockRendererFn = require("./chainBlockRendererFn");

var _chainBlockRendererFn2 = _interopRequireDefault(_chainBlockRendererFn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } // This is a meta handler


/*
 * 1. Collect all handlers appropriate for our chainable meta handler.
 * 2. Remove the original handlers from the plugins
 * 3. Add the meta handler containing the removed original handlers.
 */
var chainHandler = function chainHandler(plugins, name, metaHandler) {
  // Collect handlers.
  var extractedFns = plugins
  // Future: we could probably canonicalize plugins to a format of
  // { plugin: x, ...options } right here.
  // With options = { skip: ['handleReturn'], ignoreHandled: ['handleReturn'] }
  // Or: options = { handleReturn: { skip: true, ignoreHandled: true } }
  .filter(function (plugin) {
    return name in plugin;
  }).map(function (plugin) {
    return plugin[name];
  });

  // Remove original handlers so they can't get executed twice.
  var restPlugins = plugins.map(function (plugin) {
    var _discard = plugin[name],
        rest = _objectWithoutProperties(plugin, [name]);

    return rest;
  });

  // Package the original handlers into our chainable handler.
  restPlugins.push(metaHandler(extractedFns));
  return restPlugins;
};

/*
 * Iterate through different chainable meta handlers, changing the plugins
 * array for each of them using chainHandler.
 */
var chainRegisteredHandlers = function chainRegisteredHandlers(plugins, metaHandlers) {
  return Object.keys(metaHandlers).reduce(function (acc, name) {
    var metaHandler = metaHandlers[name];
    return chainHandler(acc, name, metaHandler);
  }, plugins);
};

/*
 * Extract all chainable plugin functions from the list of plugins and execute
 * them in a dedicated handler that provides chaining.
 * Chaining means that every handler receives the output value of the previous
 * handler, unlike draft-js-plugins default behaviour.
 */
var chainable = function chainable(metaHandlers) {
  return function (plugins) {
    return chainRegisteredHandlers(plugins, metaHandlers);
  };
};

// export default chainable({
//   handleReturn: chainHandleReturn,
//   blockRendererFn: chainBlockRendererFn
// });

exports.default = function (plugins, config) {
  return chainable({
    handleReturn: (0, _chainHandleReturn2.default)(config),
    blockRendererFn: (0, _chainBlockRendererFn2.default)(config)
  })(plugins);
};

module.exports = exports["default"];