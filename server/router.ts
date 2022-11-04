import { NextFunction, Request, Response, Router } from "express";
import * as mongo from "./mongo";
import { ObjectId } from "mongodb";
import { IBoard, IBoardPopulated, INote } from "./types";
const router = Router();

// helper function for you <3
function isMongoError(error: Error) {
  return (
    typeof error === "object" &&
    error !== null &&
    error.name === "MongoNetworkError"
  );
}

function handleError(err: Error, res: Response) {
  if (isMongoError(err)) {
    res.status(500).send("internal server error");
  } else {
    res.status(400).send("bad request");
  }
}

const idChecker = async (req: Request, res: Response, next: NextFunction) => {
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

router.post("/board", (_req: Request, res: Response, next: NextFunction) => {
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
      next();
    });
});

router.post("/note/:board_id", idChecker, async (req, res, next) => {
  const { note } = req.body;
  const boardId = mongo.toObjectId(req.params.board_id);
  try {
    const board = boardId ? await mongo.readBoard(boardId) : undefined;
    if (!board) {
      console.log("board not found");
      res.status(404).send("board not found");
    } else {
      const newNote = await mongo.createNote(board as IBoard, note);
      if (newNote) {
        res.send({ newNote: newNote });
      } else {
        res.status(500).send("unknown error");
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.get("/board/:board_id", idChecker, async (req, res, next) => {
  const boardId = mongo.toObjectId(req.params.board_id);
  try {
    let board = boardId ? await mongo.readBoard(boardId) : undefined;
    board = board ? await mongo.populateNotes(board as IBoard) : undefined;
    if (board) {
      res.send({ board });
    } else {
      res.status(404).send("board not found");
    }
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.post("/board/rename/:board_id", idChecker, async (req, res) => {
  const { name } = req.body;
  const boardId = mongo.toObjectId(req.params.board_id);

  try {
    if (boardId) {
      await mongo.renameBoard(boardId, name);
    }
    res.send({ message: "success!" });
  } catch (e: unknown) {
    if (e instanceof Error) {
      handleError(e, res);
    }
  }
});

router.get("/note/:note_id", idChecker, (req, res, next) => {
  const noteId = mongo.toObjectId(req.params.note_id);
  if (noteId) {
    mongo
      .readNote(noteId)
      .then((note) => {
        if (note) {
          res.send({ note: note });
        } else {
          res.status(404).send("board not found");
        }
      })
      .catch((err: Error) => {
        handleError(err, res);
        console.log("error", err);
        next();
      });
  } else {
    next();
  }
});

router.delete("/board/:board_id", idChecker, async (req, res, next) => {
  const boardId = mongo.toObjectId(req.params.board_id);
  try {
    const board = boardId ? await mongo.readBoard(boardId) : undefined;
    if (board) {
      await mongo.removeBoard(board as IBoardPopulated);
      res.send({ board });
    } else {
      res.status(404).send("board not found");
    }
  } catch (err) {
    if (err instanceof Error) {
      handleError(err, res);
    }
    console.log("error", err);
    next();
  }
});

router.delete("/note/:note_id", idChecker, async (req, res, next) => {
  const noteId = mongo.toObjectId(req.params.note_id);
  try {
    const note = noteId ? await mongo.readNote(noteId) : undefined;
    if (note) {
      await mongo.removeNote(note as INote);
      res.send({ note });
    } else {
      res.status(404).send("note not found");
    }
  } catch (err) {
    if (err instanceof Error) {
      handleError(err, res);
    }
    console.log("error", err);
    next();
  }
});

router.patch("/note", async (req, res, next) => {
  const { note } = req.body;
  try {
    await mongo.updateNote(note);
    res.send({ note });
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.patch("/note/:note_id/position", idChecker, async (req, res, next) => {
  const { pos } = req.body;
  const noteId = mongo.toObjectId(req.params.note_id);
  try {
    if (noteId) {
      await mongo.updateNotePos(noteId, pos);
    }
    res.send({ pos });
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.patch("/note/:note_id/size", idChecker, async (req, res, next) => {
  const { size } = req.body;
  const noteId = mongo.toObjectId(req.params.note_id);
  try {
    if (noteId) {
      await mongo.updateNoteSize(noteId, size);
    }
    res.send({ size });
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.patch("/board/:board_id/log", idChecker, async (req, res, next) => {
  const { message } = req.body;
  const boardId = mongo.toObjectId(req.params.board_id);
  try {
    if (boardId) {
      await mongo.logMessage(boardId, message);
    }
    res.send({ message });
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.delete("/board/:board_id/log", idChecker, async (req, res, next) => {
  const boardId = mongo.toObjectId(req.params.board_id);
  try {
    if (boardId) {
      await mongo.clearLog(boardId);
    }
    res.send({ message: "success!" });
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.post("/adminStats", async (req, res, next) => {
  const { secret } = req.body;
  try {
    const stats = await mongo.getAdminStats(secret);
    res.send({ stats });
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.get("/isProtected/:board_id", idChecker, async (req, res, next) => {
  const boardId = mongo.toObjectId(req.params.board_id);
  try {
    if (boardId) {
      const isProtected = await mongo.isProtected(boardId);
      res.send({ isProtected });
    } else {
      res.status(400).send("invalid board id");
    }
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.post("/protect/:board_id", idChecker, async (req, res, next) => {
  const boardId = mongo.toObjectId(req.params.board_id);
  try {
    const { password } = req.body;
    if (boardId) {
      const result = await mongo.protect(boardId, password);
      res.send({ success: !!result });
    } else {
      res.status(400).send("invalid board id");
    }
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

router.post("/checkPassword/:board_id", idChecker, async (req, res, next) => {
  const boardId = mongo.toObjectId(req.params.board_id);
  try {
    const { password } = req.body;
    if (boardId) {
      const result = await mongo.checkPassword(boardId, password);
      res.send({ success: result });
    } else {
      res.status(400).send("invalid board id");
    }
  } catch (e) {
    if (e instanceof Error) {
      handleError(e, res);
    }
    console.log("error", e);
    next();
  }
});

// for whatsappwrapped
router.get("/whatsappwrapped", (_req, res) => {
  mongo.WAWVisit();
  res.send({ message: "success" });
});

export default router;
