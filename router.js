const express = require('express');
const router = express.Router();
const mongo = require('./mongo')

// helper function for you <3
function isMongoError (error) {
  return typeof error === 'object' && error !== null && error.name === 'MongoNetworkError'
}

router.get('/api/allBoards/:id', (req, res, next) => {
  console.log('given id', req.params.id)
  mongo.readAllBoards().then(boards => {
    if (boards) {
      // console.log('in here', boards)
      res.send({boards: boards})
    } else {
      console.error('an error occured')
      next()
    }
  }).catch(err => {
    if (isMongoError(err)) {
      res.status(500).send('internal server error')
      next()
    } else {
      res.status(400).send('bad request')
      next()
    }
  })
})

module.exports = router
