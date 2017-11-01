require('./assets/setup')((regl, drawLoop) => {

  // 💖 Create all of the draw functions. 🎨
  const prepareScene = require('./assets/scene')(regl)
  const drawBackground = require('./assets/background')(regl)
  const drawDust = require('./assets/dust')(regl)
  const drawField = require('./field')(regl)

  // Run a draw loop 🏃
  drawLoop(() => {
    regl.clear({ depth: 1, color: [0, 0, 0, 1] })
    prepareScene(() => {
      drawField()
      // drawBackground()
      // drawDust()
    })
  })

})
