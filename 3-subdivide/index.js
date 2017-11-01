const regl = require('regl')()
const setupScene = require('./assets/scene')(regl)
const drawCellular = require('./cellular')(regl)
const drawBackground = require('./assets/background')(regl)
const drawDust = require('./assets/dust')(regl)
const clear = { depth: 1, color: [0, 0, 0, 1] }

const resl = require('resl')

resl({
  manifest: {
    // Texture from SEspider Productions and Pixologic
    // Used under CC license.
    matcapTexture: {
      type: 'image',
      src: './3-subdivide/assets/redwax.png',
      parser: (data) => regl.texture({ data })
    }
  },
  onDone: (assets) => {
    const frameLoop = regl.frame(() => {
      try {
        regl.clear(clear)
        setupScene(({time}) => {
          drawCellular(assets)
          // drawBackground()
          // drawDust()
        })
      } catch (error) {
        console.error(error)
        frameLoop.cancel()
      }
    })
  }
})
