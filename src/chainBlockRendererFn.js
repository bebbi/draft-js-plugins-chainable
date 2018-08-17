/*
 * Provide chaining for `blockRendererFn` functions.
 * We accumulate props and replace render components per the last plugin we
 * encounter.
 * However, we pass an additional method getCurrentRenderer
 */
export default ({ renderBlock } = {}) => blockRendererFns => ({
  blockRendererFn(block, { setEditorState, getEditorState, ...restProps }) {
    // Keep track of editorState, even if it's unlikely to be used here.
    let updatedState = getEditorState()
    const setEditorStatePlugin = newState => {
      updatedState = newState
    }
    const getEditorStatePlugin = () => updatedState

    // Keep track of the current render block so we can wrap it.
    let currentRenderer = {
      component: renderBlock
    }
    const setCurrentRenderer = Renderer => {
      currentRenderer = Renderer
    }
    const getCurrentRenderer = () => currentRenderer
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
    blockRendererFns.forEach(fn => {
      const newRenderer = fn(block, {
        setEditorState: setEditorStatePlugin,
        getEditorState: getEditorStatePlugin,
        getCurrentRenderer,
        ...restProps
      })
      // Returning undefined in the plugin has no effect.
      if (typeof newRenderer === 'object') {
        const { props, editable, component } = newRenderer
        // For props, just add them
        const curr = getCurrentRenderer
        if (typeof props !== 'undefined') {
          setCurrentRenderer({
            ...curr(),
            props: {
              ...curr().props,
              ...props
            }
          })
        }
        // For editable, set per the last plugin in the sequence.
        if (typeof editable !== 'undefined') {
          setCurrentRenderer({
            ...curr(),
            editable
          })
        }
        // For component, set per the last encountered.
        // The blockRendererFn can access previous components.
        if (typeof component !== 'undefined') {
          setCurrentRenderer({
            ...curr(),
            component
          })
        }
      }
    })
    if (updatedState !== getEditorState()) {
      setEditorState(updatedState)
    }
    return currentRenderer
  }
})
