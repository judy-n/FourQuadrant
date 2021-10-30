const express = require('express');
const router = express.Router();
const mongo = require('./mongo')

// helper function for you <3
function isMongoError (error) {
  return typeof error === 'object' && error !== null && error.name === 'MongoNetworkError'
}

function handleError (err, res) {
  if (isMongoError) {
    res.status(500).send('internal server error')
  } else {
    res.status(400).send('bad request')
  }
}

router.post('/createBoard', (req, res, next) => {
  mongo.createBoard().then(board => {
    if (board) {
      res.send({board: board})
    } else {
      res.status(500, 'unknown error')
    }
  }).catch(err => {
    handleError(err, res)
    console.log('error', err)
  })
})

router.post('/createNote/:board_id', async (req, res, next) => {
  const { quadrant } = req.body
  try {
    const board = await mongo.readBoard(req.params.board_id)
    const newNote = await mongo.createNote(board, quadrant)
    if (newNote) {
      res.send({newNote: newNote})
    }
  } catch(e) {
    handleError(e, res)
    console.log('error', e)
  }
})

module.exports = router
