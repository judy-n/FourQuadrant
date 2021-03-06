const express = require("express");
const router = express.Router();
const mongo = require("./mongo");
const { ObjectId } = require("mongodb");
const Sentencer = require('sentencer');

// helper function for you <3
function isMongoError(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    error.name === "MongoNetworkError"
  );
}

function handleError(err, res) {
  if (isMongoError) {
    res.status(500).send("internal server error");
  } else {
    res.status(400).send("bad request");
  }
}

const idChecker = async (req, res, next) => {
  if (req.params.board_id && !ObjectId.isValid(req.params.board_id)) {
    console.log("invalid board id:", req.params.board_id);
    res.status(404).send("invalid board id");
    return;
  }
  if (req.params.note_id && !ObjectId.isValid(req.params.note_id)) {
    console.log("invalid note id:", req.params.note_id);
    res.status(404).send("invalid note id");
    return;
  }
  next();
};

router.post("/board", (req, res, next) => {
  mongo
    .createBoard()
    .then((board) => {
      if (board) {
        res.send({ board: board });
      } else {
        res.status(500).send("unknown error");
      }
    })
    .catch((err) => {
      handleError(err, res);
      console.log("error", err);
      next();
    });
});

router.post("/note/:board_id", idChecker, async (req, res, next) => {
  const { note } = req.body;
  try {
    const board = await mongo.readBoard(req.params.board_id);
    if (!board) {
      console.log("board not found");
      res.status(404).send("board not found");
    }
    const newNote = await mongo.createNote(board, note);
    if (newNote) {
      res.send({ newNote: newNote });
    } else {
      res.status(500).send("unknown error");
    }
  } catch (e) {
    handleError(e, res);
    console.log("error", e);
    next();
  }
});

router.get("/board/:board_id", idChecker, async (req, res, next) => {
  try {
    let board = await mongo.readBoard(req.params.board_id);
    board = await mongo.populateNotes(board);
    if (board) {
      res.send({ board });
    } else {
      res.status(404).send("board not found");
    }
  } catch (e) {
    handleError(e, res);
    console.log("error", e);
    next();
  }
});

router.post("/board/rename/:board_id", idChecker, async (req, res, next) => {
  const { name } = req.body
  
  try {
    let r = await mongo.renameBoard(req.params.board_id, name)
    res.send({ message: "success!" })
  } catch (e) {
    handleError(e, res);
  }
})

router.get("/note/:note_id", idChecker, (req, res, next) => {
  mongo
    .readNote(req.params.note_id)
    .then((note) => {
      if (note) {
        res.send({ note: note });
      } else {
        res.status(404).send("board not found");
      }
    })
    .catch((err) => {
      handleError(err, res);
      console.log("error", e);
      next();
    });
});

router.delete("/board/:board_id", idChecker, async (req, res, next) => {
  try {
    const board = await mongo.readBoard(req.params.board_id);
    if (board) {
      await mongo.removeBoard(board);
      res.send({ board });
    } else {
      res.status(404).send("board not found");
    }
  } catch (e) {
    handleError(err, res);
    console.log("error", e);
    next();
  }
});

router.delete("/note/:note_id", idChecker, async (req, res, next) => {
  try {
    const note = await mongo.readNote(req.params.note_id);
    if (note) {
      await mongo.removeNote(note);
      res.send({ note });
    } else {
      res.status(404).send("note not found");
    }
  } catch (e) {
    handleError(err, res);
    console.log("error", e);
    next();
  }
});

router.patch("/note", async (req, res, next) => {
  const { note } = req.body;
  try {
    await mongo.updateNote(note);
    res.send({ note });
  } catch (e) {
    handleError(e, res);
    console.log("error", e);
    next();
  }
});

router.patch("/note/:note_id/position", idChecker, async (req, res, next) => {
  const { pos } = req.body;
  try {
    await mongo.updateNotePos(req.params.note_id, pos);
    res.send({ pos });
  } catch (e) {
    handleError(e, res);
    console.log("error", e);
    next();
  }
});

router.patch("/note/:note_id/size", idChecker, async (req, res, next) => {
  const { size } = req.body;
  try {
    await mongo.updateNoteSize(req.params.note_id, size);
    res.send({ size });
  } catch (e) {
    handleError(e, res);
    console.log("error", e);
    next();
  }
});

router.patch('/board/:board_id/log', idChecker, async (req, res, next) => {
  const { message } = req.body
  try {
    await mongo.logMessage(req.params.board_id, message)
    res.send({message})
  } catch (e) {
    handleError(e, res)
    console.log('error', e)
    next()
  }
})

router.delete('/board/:board_id/log', idChecker, async (req, res, next) => {
  try {
    await mongo.clearLog(req.params.board_id)
    res.send({ message: 'success' })
  } catch (e) {
    handleError(e, res)
    console.log('error', e)
    next()
  }
})

router.post('/adminStats', async (req, res, next) => {
  const { secret } = req.body
  try {
    const stats = await mongo.getAdminStats(secret)
    res.send({ stats })
  } catch (e) {
    handleError(e, res)
    console.log('error', e)
    next()
  }
})

router.get('/isProtected/:board_id', idChecker, async (req, res, next) => {
  try {
    const isProtected = await mongo.isProtected(req.params.board_id)
    res.send({ isProtected })
  } catch (e) {
    handleError(e, res)
    console.log('error', e)
    next()
  }
})

router.post('/protect/:board_id', idChecker, async (req, res, next) => {
  try {
    const { password } = req.body
    const result = await mongo.protect(req.params.board_id, password)
    res.send({ success: !!result })
  } catch (e) {
    handleError(e, res)
    console.log('error', e)
    next()
  }
})

router.post('/checkPassword/:board_id', idChecker, async (req, res, next) => {
  try {
    const { password } = req.body
    const result = await mongo.checkPassword(req.params.board_id, password)
    res.send({ success: result })
  } catch (e) {
    handleError(e, res)
    console.log('error', e)
    next()
  }
})

// for whatsappwrapped
router.get('/whatsappwrapped', (req, res, next) => {
  mongo.WAWVisit()
  res.send({ message: "success" })
})

module.exports = router
