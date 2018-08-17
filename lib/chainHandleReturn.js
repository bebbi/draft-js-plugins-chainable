'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/*
 * Provide chaining for `handleReturn` functions.
 * Original handlers can still stop further execution by returning 'handled'.
 */
exports.default = function () {
  return function (handleReturnFns) {
    return {
      handleReturn: function handleReturn(event, editorState, _ref) {
        var setEditorState = _ref.setEditorState,
            restProps = _objectWithoutProperties(_ref, ['setEditorState']);

        // anyHandled is to know whether any or none of the plugins has returned
        // 'handled' in the end.
        var anyHandled = false;
        var updatedState = editorState;
        var setEditorStatePlugin = function setEditorStatePlugin(newState) {
          updatedState = newState;
        };

        handleReturnFns.some(function (plugin) {
          var handledStr = plugin(event, updatedState, _extends({
            setEditorState: setEditorStatePlugin
          }, restProps));

          var handled = handledStr === 'handled';
          anyHandled = handled || anyHandled;
          return handled;
        });
        if (updatedState !== editorState) {
          setEditorState(updatedState);
        }
        return anyHandled ? 'handled' : 'not-handled';
      }
    };
  };
};

module.exports = exports['default'];