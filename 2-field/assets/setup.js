module.exports = function(callback) {
  require('regl')({
    extensions: ['oes_element_index_uint'],
    onDone: (err, regl) => {
      if (err) {
        console.log(err)
        return
      }
      callback(regl, loopCallback => {
        const frameLoop = regl.frame(() => {
          try {
            loopCallback()
          } catch (error) {
            console.error(error)
            frameLoop.cancel()
          }
        })
      })
    }
  })
}
