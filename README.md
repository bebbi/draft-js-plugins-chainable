# draft-js-plugins-chainable

## Note: Archived

## Why?

The main motivation for this package was [this issue](https://github.com/draft-js-plugins/draft-js-plugins/issues/1162):

If you have multiple plugins that contain a `handleReturn` function, they can't be chained even if they return `'not-handled'`:

While they do run in this situation, but they all operate on the identical pre-handler `editorState`, as opposed to the output of one handler being passed on to the next.

If you need such chaining behaviour, this library can help: Every return handler passes its updated `editorState` to the next return handler as input.

This works on existing plugins without change.

In addition to `handleReturn`, also `blockRendererFn` can be chained, i.e. the render block which one `blockRendererFn` returns can be used in the next `blockRendererFn`. Your regular plugin receives an additional function `getCurrentRenderer` to retrieve the last block selected. You need to provide a default block for this to work though, see `Usage`.

Note that the `blockRendererFn` mechanism is experimental, I'm not using it right now.

## Install

    yarn add draft-js-plugins-chainable

## Usage

    import Editor from 'draft-js-plugins-editor'
    import chainable from 'draft-js-plugins-chainable'
    import { EditorBlock } from 'draft-js'

    const plugins = chainable([
      myExistingPlugin1(),
      myExistingPlugin2()
    ], { renderBlock: EditorBlock })

    ...

    render() {
      return (
        <Editor plugins={plugins} {...otherProps} />
      )
    }

## Roadmap

We could consider adding options to plugins to skip single handlers altogether, or ignore them returning `'handled'`. This would allow for more flexible integration with existing plugins such as `draft-js-focus-plugin`.
