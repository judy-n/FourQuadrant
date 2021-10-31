const express = require('express');
const router = express.Router();
const mongo = require('./mongo')
const { ObjectId } = require('mongodb')

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

const idChecker = async (req, res, next) => {
  if (req.params.board_id && !ObjectId.isValid(req.params.board_id)) {
    log('invalid board id:', req.params.board_id)
    res.status(404).send('invalid board id')
    return
  }
  if (req.params.note_id && !ObjectId.isValid(req.params.note_id)) {
    log('invalid note id:', req.params.note_id)
    res.status(404).send('invalid note id')
    return
  }
  next()
}

router.post('/board', (req, res, next) => {
  mongo.createBoard().then(board => {
    if (board) {
      res.send({board: board})
    } else {
      res.status(500).send('unknown error')
    }
  }).catch(err => {
    handleError(err, res)
    console.log('error', err)
    next()
  })
})

router.post('/note/:board_id', idChecker, async (req, res, next) => {
  const { quadrant } = req.body
  try {
    const board = await mongo.readBoard(req.params.board_id)
    if (!board) {
      console.log('board not found')
      res.status(404).send('board not found')
    }
    const newNote = await mongo.createNote(board, quadrant)
    if (newNote) {
      res.send({newNote: newNote})
    } else {
      res.status(500).send('unknown error')
    }
  } catch(e) {
    handleError(e, res)
    console.log('error', e)
    next()
  }
})

router.get('/board/:board_id', idChecker, (req, res, next) => {
  mongo.readBoard(req.params.board_id).then(board => {
    if (board) {
      res.send({board: board})
    } else {
      res.status(404).send('board not found')
    }
  }).catch(err => {
    handleError(err)
    console.log('error', e)
    next()
  })
})

router.get('/note/:note_id', idChecker, (req, res, next) => {
  mongo.readNote(req.params.note_id).then(note => {
    if (note) {
      res.send({note: note})
    } else {
      res.status(404).send('board not found')
    }
  }).catch(err => {
    handleError(err)
    console.log('error', e)
    next()
  })
})

router.delete('/board/:board_id', idChecker, async (req, res, next) => {
  try {
    const board = await mongo.readBoard(req.params.board_id)
    if (board) {
      await mongo.removeBoard(board)
      res.send({board})
    } else {
      res.status(404).send('board not found')
    }
  } catch (e) {
    handleError(err)
    console.log('error', e)
    next()
  }
})

router.delete('/note/:note_id', idChecker, async (req, res, next) => {
  try {
    const note = await mongo.readNote(req.params.note_id)
    if (note) {
      await mongo.removeNote(note)
      res.send({note})
    } else {
      res.status(404).send('note not found')
    }
  } catch (e) {
    handleError(err)
    console.log('error', e)
    next()
  }
})

router.patch('/note', async (req, res, next) => {
  const { note } = req.body
  try {
    await mongo.updateNote(note)
    res.send({note})
  } catch (e) {
    handleError(e)
    console.log('error', e)
    next()
  }
})

module.exports = router
