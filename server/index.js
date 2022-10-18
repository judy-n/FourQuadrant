const { config } = require("dotenv")
config();
const express = require("express")
const cors = require("cors")
const path = require("path")
const http = require("http")
const app = express()
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const port = process.env.PORT || 8080
const router = require("./router")
const Sentencer = require("sentencer")
const session = require("express-session")
const { MemoryStore } = require("express-session")
const { readBoard, logVisitor } = require("./mongo")
const { ObjectId } = require("mongodb")

const idChecker = async (req, res, next) => {
  if (req.params.boardID && !ObjectId.isValid(req.params.boardID)) {
    console.log("invalid board id:", req.params.board_id);
    res.sendFile(path.join(__dirname, '../client/dist/error/index.html'))
    return;
  }
  next();
};

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../client/dist')))
// allow cors on dev
if (process.env.NODE_ENV === "development") {
  console.log('allowing')
  app.use(cors())
}
  
app.use('/api', router);

app.use(
  session({
    secret: "a hardcoded secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 36000000,
      sameSite: "strict",
      httpOnly: true,
    },
    store: new MemoryStore(),
    unset: "destroy",
  })
);

app.get('/api/username', async (req, res, next) => {
  if (!req.session || !req.session.username) {
    req.session.username = Sentencer.make("{{ adjective }}-{{ noun }}")
  }
  logVisitor(req.session.username)
  res.send({ username: req.session.username })
})

app.post('/api/username', async (req, res, next) => {
  const { username } = req.body
  if (req.session) {
    req.session.username = username
    res.send({ message: 'success' })
  } else {
    res.status(400).send({ message: 'unsuccessful' })
  }
})

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.get('/', requireHTTPS, function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
})

app.get('/admin', requireHTTPS, function(req, res) {
  res.sendFile(path.join(__dirname, '../client/dist/admin/index.html'))
})

app.get('/:boardID', requireHTTPS, idChecker, async function(req, res){
  if (!(await readBoard(req.params.boardID))) {
    res.sendFile(path.join(__dirname, '../client/dist/error/index.html'))
  }
  res.sendFile(path.join(__dirname, '../client/dist/board/index.html'))
})

// socket.io functions
/**
 * Functions we need for sockets:
 * note: create new
 * note: update text
 * note: update position
 * note: resize
 * note: delete
 * currently probly wont scale great -
 */
io.on('connection', socket => {
  // socket.emit('receive name', { name: Sentencer.make("{{ adjective }}-{{ noun }}") })
  
  socket.on("note created", ({ note, board_id, username }) => {
    socket.broadcast.emit("receive note", { note, io_board_id: board_id, username });
    const title = (note && note.title) || '[no title]'
    io.emit('receive create log', {io_board_id: board_id, username, title})
  });

  socket.on("note update", ({ note, board_id, username }) => {
    socket.broadcast.emit("receive update", { note, io_board_id: board_id });
    const title = (note && note.title) || '[no title]'
    io.emit('receive update log', { io_board_id: board_id, username, title})
  });

  socket.on("note move", ({ note_id, pos, board_id }) => {
    socket.broadcast.emit("receive move", {
      note_id,
      pos,
      io_board_id: board_id,
    });
  });

  socket.on('note delete', async ({note_id, board_id, username, title}) => {
    socket.broadcast.emit('receive delete', {note_id, io_board_id: board_id, username})
    io.emit('receive delete log', {io_board_id: board_id, username, title: title || '[no title]'})
  })

  socket.on('log message', ({board_id, message}) => {
    io.emit('receive message', {io_board_id: board_id, message})
  })
  socket.on("note resize", ({ note_id, size, board_id }) => {
    socket.broadcast.emit("receive resize", {
      note_id,
      size,
      io_board_id: board_id,
    });
  });
});

server.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
