const {MongoClient} = require('mongodb');
require('dotenv').config();

async function main(){
    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.flfdi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        // Make the appropriate DB calls
        
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
    console.log("created a board!");
    return newBoard;
}

async function createNote(client, board){
    const newNote = new Note()
    await client.db("FourQuadrant").collection("Notes").insertOne(newNote)
    board.notes.push(newNote)
    console.log("created a note!");
    console.log(board.notes)
    return newNote;
}




