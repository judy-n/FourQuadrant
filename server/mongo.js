require("dotenv").config();
console.log("WHAT IS", process.env.MONGODB_URI)
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const uri = process.env.MONGODB_URI;
const client = new MongoClient("mongodb://root:rootpassword@mongodb");

(async () => {
  try {
    await client.connect()
    console.log("SET UP MONGODB SUCKAA")
  } catch (e) {
    console.error(e)
    throw new Error("ERROR SETTING UP MONGODB")
  }
})()

async function listDatabases() {
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}

class Board {
  constructor() {
    this._id = new ObjectId();
    this.notes = [];
    this.log = [];
    this.createdAt = new Date();
    this.password = "";
    this.isProtected = false;
    this.name = "My Board";
  }
}

class Note {
  constructor({ title, text, pos, size }) {
    this._id = new ObjectId();
    this.title = title;
    this.text = text;
    this.pos = pos;
    this.size = size;
    this.createdAt = new Date();
  }
}

class Visit {
  constructor(username) {
    this.visitedAt = new Date();
    this.username = username || "[Name not set]";
  }
}

async function createBoard() {
  const newBoard = new Board();
  const resBoard = await client
    .db("FourQuadrant")
    .collection("Boards")
    .insertOne(newBoard);
  return newBoard;
}

async function createNote(board, note) {
  const newNote = new Note(note);
  await client.db("FourQuadrant").collection("Notes").insertOne(newNote);
  board.notes.push(newNote._id);
  await client
    .db("FourQuadrant")
    .collection("Boards")
    .updateOne({ _id: board._id }, { $set: board });
  return newNote;
}

async function readBoard(id) {
  id = new ObjectId(id);
  const res = await client
    .db("FourQuadrant")
    .collection("Boards")
    .findOne({ _id: id });
  if (res) {
    return res;
  } else {
    console.log("Couldn't find this Board");
    return null;
  }
}

async function renameBoard(id, name) {
  // change board.name
  const res = await client
    .db("FourQuadrant")
    .collection("Boards")
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { name: name } });
  // don't know what res is here
  return res;
}

async function populateNotes(board) {
  // call this function when you need note objects, not just ids
  const notes = board.notes.map((id) => new ObjectId(id));
  const noteObjs = await client
    .db("FourQuadrant")
    .collection("Notes")
    .find({ _id: { $in: notes } })
    .toArray();
  if (noteObjs) {
    return {
      ...board,
      notes: noteObjs,
    };
  } else {
    console.log("unknown error");
    return null;
  }
}

async function readNote(id) {
  id = new ObjectId(id);
  const res = await client
    .db("FourQuadrant")
    .collection("Notes")
    .findOne({ _id: id });
  if (res) {
    return res;
  } else {
    console.log("Couldn't find this Note");
    return null;
  }
}

async function removeBoard(board) {
  for (let i = 0; i < board.notes.length; i++) {
    await client
      .db("FourQuadrant")
      .collection("Notes")
      .deleteOne({ _id: board.notes[i]._id });
  }
  await client
    .db("FourQuadrant")
    .collection("Boards")
    .deleteOne({ _id: board._id });
  return;
}

async function removeNote(note) {
  await client
    .db("FourQuadrant")
    .collection("Notes")
    .deleteOne({ _id: note._id });
  await client
    .db("FourQuadrant")
    .collection("Boards")
    .updateOne({ notes: note._id }, { $pull: { notes: note._id } });
  return;
}

async function updateNote(note) {
  note._id = new ObjectId(note._id);
  const res = await client
    .db("FourQuadrant")
    .collection("Notes")
    .updateOne({ _id: note._id }, { $set: note });
}

async function updateNotePos(note_id, pos) {
  note_id = new ObjectId(note_id);
  const res = await client
    .db("FourQuadrant")
    .collection("Notes")
    .updateOne(
      { _id: note_id },
      { $set: { pos } },
      { returnNewDocument: true }
    );
  return res;
}

async function updateNoteSize(note_id, size) {
  note_id = new ObjectId(note_id);
  const res = await client
    .db("FourQuadrant")
    .collection("Notes")
    .updateOne(
      { _id: note_id },
      { $set: { size } },
      { returnNewDocument: true }
    );
  return res;
}

async function logMessage(board_id, message) {
  board_id = new ObjectId(board_id);
  const res = await client
    .db("FourQuadrant")
    .collection("Boards")
    .updateOne({ _id: board_id }, { $push: { log: message } });
}

async function clearLog(board_id) {
  board_id = new ObjectId(board_id);
  const res = await client
    .db("FourQuadrant")
    .collection("Boards")
    .updateOne({ _id: board_id }, {$set: { log: [] }});
}

async function logVisitor(username) {
  let visit = new Visit(username);
  await client.db("FourQuadrant").collection("Visits").insertOne(visit);
  return visit;
}

async function getAdminStats(secret) {
  return await client
    .db("FourQuadrant")
    .collection("Insights")
    .findOne({ secret });
}

async function isProtected(board_id) {
  board_id = new ObjectId(board_id);
  const board = await client
    .db("FourQuadrant")
    .collection("Boards")
    .findOne({ _id: board_id });
  return board && board.isProtected;
}

async function protect(board_id, password) {
  board_id = new ObjectId(board_id);
  let isProtected = true;
  if (!password) {
    isProtected = false;
  }
  password = bcrypt.hashSync(password, 10);
  return await client
    .db("FourQuadrant")
    .collection("Boards")
    .updateOne({ _id: board_id }, { $set: { password, isProtected } });
}

async function checkPassword(board_id, password) {
  board_id = new ObjectId(board_id);
  const resPassword = (
    (await client
      .db("FourQuadrant")
      .collection("Boards")
      .findOne({ _id: board_id })) || { password: "" }
  ).password;
  return bcrypt.compareSync(password, resPassword);
}

async function WAWVisit() {
  return await client
    .db("WhatsAppWrapped")
    .collection("Visits")
    .insertOne({ visitedAt: new Date() });
}

module.exports = {
  Board,
  Note,
  createNote,
  createBoard,
  readBoard,
  renameBoard,
  populateNotes,
  readNote,
  removeBoard,
  removeNote,
  updateNote,
  updateNotePos,
  updateNoteSize,
  logMessage,
  clearLog,
  logVisitor,
  getAdminStats,
  isProtected,
  protect,
  checkPassword,
  WAWVisit,
};
