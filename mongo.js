const {MongoClient, ObjectId} = require('mongodb');
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.flfdi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
client.connect().catch(err => console.error(err))

async function listDatabases(){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

class Board {
    constructor() {
        this._id = new ObjectId()
        this.notes = []
    }
}

class Note {
    constructor({urgent: x, important: y}) {
        this._id = new ObjectId()
        this.text = "";
        this.quadrant = {urgent: x, important: y};
    }
}

async function createBoard(){
    const newBoard = new Board()
    const resBoard = await client.db("FourQuadrant").collection("Boards").insertOne(newBoard)
    return newBoard;
}

async function createNote(board, quadrant){
    const newNote = new Note(quadrant)
    await client.db("FourQuadrant").collection("Notes").insertOne(newNote)
    board.notes.push(newNote._id)
    await client.db("FourQuadrant").collection("Boards").updateOne({_id: board._id}, {$set: board})
    return newNote;
}


async function readBoard(id){
    id = new ObjectId(id)
    const res = await client.db("FourQuadrant").collection("Boards").findOne({_id: id})
    if (res) {
        console.log(res)
        return res
    }
    else {
        console.log("Couldn't find this Board")
        return null
    }
}

async function populateNotes(board) {
    // call this function when you need note objects, not just ids
    const notes = board.notes.map(id => new ObjectId(id))
    const noteObjs = await client.db("FourQuadrant").collection("Notes").find({ _id: { $in: notes }})
    if (noteObjs) {
        return noteObjs
    } else {
        console.log('unknown error')
        return null
    }
}

async function readNote(id){
    id = new ObjectId(id)
    const res = await client.db("FourQuadrant").collection("Notes").findOne({_id: id})
    if (res) {
        console.log(res)
        return res
    }
    else {
        console.log("Couldn't find this Note")
        return null
    }
}

async function removeBoard(board){
    for (let i = 0; i<board.notes.length ; i++){
        await client.db("FourQuadrant").collection("Notes").deleteOne({_id: board.notes[i]._id});
    }
    await client.db("FourQuadrant").collection("Boards").deleteOne({_id: board._id})
    return
}

async function removeNote(note){
    await client.db("FourQuadrant").collection("Notes").deleteOne({_id: note._id});
    await client.db("FourQuadrant").collection("Boards").updateOne({ notes: note._id }, { $pull: { notes: note._id } })
    return
}

/* Changes the Note's text to <text>*/
async function updateNote(note){
    await client.db("FourQuadrant").collection("Notes").updateOne({_id: note._id}, {$set: note});
}

module.exports = {
    Board,
    Note,
    createNote,
    createBoard,
    readBoard,
    populateNotes,
    readNote,
    removeBoard,
    removeNote,
    updateNote,
}