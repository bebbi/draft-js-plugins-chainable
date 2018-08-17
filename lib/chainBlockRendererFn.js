'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/*
 * Provide chaining for `blockRendererFn` functions.
 * We accumulate props and replace render components per the last plugin we
 * encounter.
 * However, we pass an additional method getCurrentRenderer
 */
exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      renderBlock = _ref.renderBlock;

  return function (blockRendererFns) {
    return {
      blockRendererFn: function blockRendererFn(block, _ref2) {
        var setEditorState = _ref2.setEditorState,
            getEditorState = _ref2.getEditorState,
            restProps = _objectWithoutProperties(_ref2, ['setEditorState', 'getEditorState']);

        // Keep track of editorState, even if it's unlikely to be used here.
        var updatedState = getEditorState();
        var setEditorStatePlugin = function setEditorStatePlugin(newState) {
          updatedState = newState;
        };
        var getEditorStatePlugin = function getEditorStatePlugin() {
          return updatedState;
        };

        // Keep track of the current render block so we can wrap it.
        var currentRenderer = {
          component: renderBlock
        };
        var setCurrentRenderer = function setCurrentRenderer(Renderer) {
          currentRenderer = Renderer;
        };
        var getCurrentRenderer = function getCurrentRenderer() {
          return currentRenderer;
        };
        // Convenience method - is it useful?
        /*
        const wrapCurrentComponent = Wrapper => {
          currentRenderer.component = props => {
            return (
              <Wrapper {...props}>
                <currentRenderer.component {...props} />
              </Wrapper>
            )
          }
        }
        */
        blockRendererFns.forEach(function (fn) {
          var newRenderer = fn(block, _extends({
            setEditorState: setEditorStatePlugin,
            getEditorState: getEditorStatePlugin,
            getCurrentRenderer: getCurrentRenderer
          }, restProps));
          // Returning undefined in the plugin has no effect.
          if ((typeof newRenderer === 'undefined' ? 'undefined' : _typeof(newRenderer)) === 'object') {
            var props = newRenderer.props,
                editable = newRenderer.editable,
                component = newRenderer.component;
            // For props, just add them

            var curr = getCurrentRenderer;
            if (typeof props !== 'undefined') {
              setCurrentRenderer(_extends({}, curr(), {
                props: _extends({}, curr().props, props)
              }));
            }
            // For editable, set per the last plugin in the sequence.
            if (typeof editable !== 'undefined') {
              setCurrentRenderer(_extends({}, curr(), {
                editable: editable
              }));
            }
            // For component, set per the last encountered.
            // The blockRendererFn can access previous components.
            if (typeof component !== 'undefined') {
              setCurrentRenderer(_extends({}, curr(), {
                component: component
              }));
            }
          }
        });
        if (updatedState !== getEditorState()) {
          setEditorState(updatedState);
        }
        return currentRenderer;
      }
    };
  };
};

module.exports = exports['default'];