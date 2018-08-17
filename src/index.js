// This is a meta handler
import chainHandleReturn from './chainHandleReturn'
import chainBlockRendererFn from './chainBlockRendererFn'

/*
 * 1. Collect all handlers appropriate for our chainable meta handler.
 * 2. Remove the original handlers from the plugins
 * 3. Add the meta handler containing the removed original handlers.
 */
const chainHandler = (plugins, name, metaHandler) => {
  // Collect handlers.
  const extractedFns = plugins
    // Future: we could probably canonicalize plugins to a format of
    // { plugin: x, ...options } right here.
    // With options = { skip: ['handleReturn'], ignoreHandled: ['handleReturn'] }
    // Or: options = { handleReturn: { skip: true, ignoreHandled: true } }
    .filter(plugin => name in plugin)
    .map(plugin => plugin[name])

  // Remove original handlers so they can't get executed twice.
  const restPlugins = plugins.map(plugin => {
    const { [name]: _discard, ...rest } = plugin
    return rest
  })

  // Package the original handlers into our chainable handler.
  restPlugins.push(metaHandler(extractedFns))
  return restPlugins
}

/*
 * Iterate through different chainable meta handlers, changing the plugins
 * array for each of them using chainHandler.
 */
const chainRegisteredHandlers = (plugins, metaHandlers) => {
  return Object.keys(metaHandlers).reduce((acc, name) => {
    const metaHandler = metaHandlers[name]
    return chainHandler(acc, name, metaHandler)
  }, plugins)
}

/*
 * Extract all chainable plugin functions from the list of plugins and execute
 * them in a dedicated handler that provides chaining.
 * Chaining means that every handler receives the output value of the previous
 * handler, unlike draft-js-plugins default behaviour.
 */
const chainable = metaHandlers => plugins => {
  return chainRegisteredHandlers(plugins, metaHandlers)
}

// export default chainable({
//   handleReturn: chainHandleReturn,
//   blockRendererFn: chainBlockRendererFn
// });

export default (plugins, config) =>
  chainable({
    handleReturn: chainHandleReturn(config),
    blockRendererFn: chainBlockRendererFn(config)
  })(plugins)
