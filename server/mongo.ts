import { config } from "dotenv";
config();
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { IBoard, IBoardPopulated, INote, IVisit } from "./types";
const client = new MongoClient("mongodb://root:rootpassword@mongodb");

(async () => {
  try {
    await client.connect();
    console.log("SET UP MONGODB SUCKAA");
  } catch (e) {
    console.error(e);
    throw new Error("ERROR SETTING UP MONGODB");
  }
})();

class Board {
  _id: ObjectId;
  notes: ObjectId[];
  log: string[];
  createdAt: Date;
  password: string;
  isProtected: boolean;
  name: string;

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
  _id: ObjectId;
  title: string;
  text: string;
  pos: INote["pos"];
  size: INote["size"];
  createdAt: Date;

  constructor({ title, text, pos, size }: INote) {
    this._id = new ObjectId();
    this.title = title;
    this.text = text;
    this.pos = pos;
    this.size = size;
    this.createdAt = new Date();
  }
}

class Visit implements IVisit {
  visitedAt: Date;
  username: string;

  constructor(username: string) {
    this.visitedAt = new Date();
    this.username = username || "[Name not set]";
  }
}

export const toObjectId = (objectId: string) =>
  ObjectId.isValid(objectId) ? new ObjectId(objectId) : undefined;

export async function createBoard() {
  const newBoard = new Board();
  await client.db("FourQuadrant").collection("Boards").insertOne(newBoard);
  return newBoard;
}

export async function createNote(board: IBoard, note: INote) {
  const newNote = new Note(note);
  await client.db("FourQuadrant").collection("Notes").insertOne(newNote);
  board.notes.push(newNote._id);
  await client
    .db("FourQuadrant")
    .collection("Boards")
    .updateOne({ _id: board._id }, { $set: board });
  return newNote;
}

export async function readBoard(id: ObjectId) {
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

export async function renameBoard(id: ObjectId, name: string) {
  // change board.name
  const res = await client
    .db("FourQuadrant")
    .collection("Boards")
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { name: name } });
  // don't know what res is here
  return res;
}

export async function populateNotes(board: IBoard) {
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

export async function readNote(id: ObjectId) {
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

export async function removeBoard(board: IBoardPopulated) {
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

export async function removeNote(note: INote) {
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

export async function updateNote(note: INote) {
  note._id = new ObjectId(note._id);
  await client
    .db("FourQuadrant")
    .collection("Notes")
    .updateOne({ _id: note._id }, { $set: note });
}

export async function updateNotePos(note_id: ObjectId, pos: INote["pos"]) {
  note_id = new ObjectId(note_id);
  const res = await client
    .db("FourQuadrant")
    .collection("Notes")
    .findOneAndUpdate(
      { _id: note_id },
      { $set: { pos } },
      { returnDocument: "after" }
    );
  return res;
}

export async function updateNoteSize(note_id: ObjectId, size: INote["size"]) {
  note_id = new ObjectId(note_id);
  const res = await client
    .db("FourQuadrant")
    .collection("Notes")
    .findOneAndUpdate(
      { _id: note_id },
      { $set: { size } },
      { returnDocument: "after" }
    );
  return res;
}

export async function logMessage(board_id: ObjectId, message: string) {
  board_id = new ObjectId(board_id);
  await client
    .db("FourQuadrant")
    .collection("Boards")
    .updateOne({ _id: board_id }, { $push: { log: message } });
}

export async function clearLog(board_id: ObjectId) {
  board_id = new ObjectId(board_id);
  await client
    .db("FourQuadrant")
    .collection("Boards")
    .updateOne({ _id: board_id }, { $set: { log: [] } });
}

export async function logVisitor(username: string) {
  const visit = new Visit(username);
  await client.db("FourQuadrant").collection("Visits").insertOne(visit);
  return visit;
}

export async function getAdminStats(secret: string) {
  return await client
    .db("FourQuadrant")
    .collection("Insights")
    .findOne({ secret });
}

export async function isProtected(board_id: ObjectId) {
  board_id = new ObjectId(board_id);
  const board = await client
    .db("FourQuadrant")
    .collection("Boards")
    .findOne({ _id: board_id });
  return board && board.isProtected;
}

export async function protect(board_id: ObjectId, password: string) {
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

export async function checkPassword(board_id: ObjectId, password: string) {
  board_id = new ObjectId(board_id);
  const resPassword = (
    (await client
      .db("FourQuadrant")
      .collection("Boards")
      .findOne({ _id: board_id })) || { password: "" }
  ).password;
  return bcrypt.compareSync(password, resPassword);
}

export async function WAWVisit() {
  return await client
    .db("WhatsAppWrapped")
    .collection("Visits")
    .insertOne({ visitedAt: new Date() });
}
