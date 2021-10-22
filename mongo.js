const {MongoClient} = require('mongodb');
require('dotenv').config();

async function main(){
    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.flfdi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        // Make the appropriate DB calls
        // await listDatabases(client); 
        
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
    constructor() {
        this.text = "";
    }
}

async function createBoard(client){
    const newBoard = new Board()
    await client.db("FourQuadrant").collection("Boards").insertOne(newBoard)
    return newBoard;
}

async function createNote(client, board){
    const newNote = new Note()
    await client.db("FourQuadrant").collection("Notes").insertOne(newNote)
    board.notes.push(newNote)
    await client.db("FourQuadrant").collection("Boards").updateOne({_id: board._id}, {$set: board})
    return newNote;
}

async function getNotes(board){
    return board.notes;
}

async function removeNote(client, board, note){
    let j = board.notes.indexOf(note);
    board.notes.splice(j, 1)
    let q = {_id: board._id};
    let newV = {$set: board}
    await client.db("FourQuadrant").collection("Boards").updateOne(q, newV);
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



