/*
 * Provide chaining for `handleReturn` functions.
 * Original handlers can still stop further execution by returning 'handled'.
 */
export default () => handleReturnFns => ({
  handleReturn(event, editorState, { setEditorState, ...restProps }) {
    // anyHandled is to know whether any or none of the plugins has returned
    // 'handled' in the end.
    let anyHandled = false
    let updatedState = editorState
    const setEditorStatePlugin = newState => {
      updatedState = newState
    }

    handleReturnFns.some(plugin => {
      const handledStr = plugin(event, updatedState, {
        setEditorState: setEditorStatePlugin,
        ...restProps
      })

      const handled = handledStr === 'handled'
      anyHandled = handled || anyHandled
      return handled
    })
    if (updatedState !== editorState) {
      setEditorState(updatedState)
    }
    return anyHandled ? 'handled' : 'not-handled'
  }
})
