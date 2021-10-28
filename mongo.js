const {MongoClient} = require('mongodb');
require('dotenv').config();

async function main(){
    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.flfdi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        // Make the appropriate DB calls
        // testing
        // await listDatabases(client); 
        // b = await createBoard(client)
        // n1 = await createNote(client, b, {urgent: 1, important: 1});
        // // n2 = await createNote(client, b)
        // // //await readBoard(client, b._id)
        // await updateNote(client, b, n1, "hi this is a note")
        // //await readNote(client, n1._id)
        // await updateNoteQdt(client, b, n1, {urgent: 0, important: 1});
        // await readNote(client, n1._id)
        // await readBoard(client, b._id)
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

main().catch(console.error);

class Board {
    constructor() {
        this.notes = []
    }
}

class Note {
    constructor({urgent: x, important: y}) {
        this.text = "";
        this.quadrant = {urgent: x, important: y};
    }
}

async function createBoard(client){
    const newBoard = new Board()
    await client.db("FourQuadrant").collection("Boards").insertOne(newBoard)
    return newBoard;
}

async function createNote(client, board, quadrant){
    const newNote = new Note(quadrant)
    await client.db("FourQuadrant").collection("Notes").insertOne(newNote)
    board.notes.push(newNote)
    await client.db("FourQuadrant").collection("Boards").updateOne({_id: board._id}, {$set: board})
    return newNote;
}


async function readBoard(client, id){
    const res = await client.db("FourQuadrant").collection("Boards").findOne({_id: id})
    if (res) {
        console.log(res)
    }
    else {
        console.log("Couldn't find this Board")
    }
}

async function readNote(client, id){
    const res = await client.db("FourQuadrant").collection("Notes").findOne({_id: id})
    if (res) {
        console.log(res)
    }
    else {
        console.log("Couldn't find this Note")
    }
}

async function removeBoard(client, board){
    for (let i = 0; i<board.notes.length ; i++){
        await client.db("FourQuadrant").collection("Notes").deleteOne({_id: board.notes[i]._id});
    }
    await client.db("FourQuadrant").collection("Boards").deleteOne({_id: board._id})
}

async function removeNote(client, board, note){
    let j = board.notes.indexOf(note);
    board.notes.splice(j, 1)
    let q = {_id: board._id};
    let newV = {$set: board}
    await client.db("FourQuadrant").collection("Notes").deleteOne({_id: note._id});
    await client.db("FourQuadrant").collection("Boards").updateOne(q, newV);
}

/* Changes the Note's text to <text>*/
async function updateNote(client, board, note, text){
    let k = board.notes.indexOf(note);
    board.notes[k].text = text;
    await client.db("FourQuadrant").collection("Notes").updateOne({_id: note._id}, {$set: note});
    await client.db("FourQuadrant").collection("Boards").updateOne({_id: board._id}, {$set: board});
}

/* Updates the Note's quadrant position to <quadrant>; should be of the form {urgent: 0, important: 0} */
async function updateNoteQdt(client, board, note, quadrant){
    let k = board.notes.indexOf(note);
    board.notes[k].quadrant = quadrant;
    await client.db("FourQuadrant").collection("Notes").updateOne({_id: note._id}, {$set: note});
    await client.db("FourQuadrant").collection("Boards").updateOne({_id: board._id}, {$set: board});
}

module.exports = {
    Board,
    Note,
    createNote,
    createBoard,
    readBoard,
    readNote,
    removeBoard,
    removeNote,
    updateNote,
    updateNoteQdt
}