const express = require('express')
const path = require('path')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const port = process.env.PORT || 3000
const router = require('./router')
const Sentencer = require('sentencer')
const session = require('express-session')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/client/static')))
app.use('/api', router);

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.get('/', requireHTTPS, function(req, res) {
  res.sendFile(path.join(__dirname, '/client/index.html'));
})

app.get('/undefined', requireHTTPS, function(req, res) {
  res.send('Error loading board :(')
})

app.get('/:boardID', requireHTTPS, function(req, res){
  res.sendFile(path.join(__dirname, '/client/board.html'))
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
  socket.emit('receive name', { name: Sentencer.make("{{ adjective }}-{{ noun }}") })
  
  socket.on("note created", ({ note, board_id }) => {
    socket.broadcast.emit("receive note", { note, io_board_id: board_id });
  });

  socket.on("note update", ({ note, board_id }) => {
    socket.broadcast.emit("receive update", { note, io_board_id: board_id });
  });

  socket.on("note move", ({ note_id, pos, board_id }) => {
    socket.broadcast.emit("receive move", {
      note_id,
      pos,
      io_board_id: board_id,
    });
  });

  socket.on('note delete', ({note_id, board_id}) => {
    socket.broadcast.emit('receive delete', {note_id, io_board_id: board_id})
  })

  socket.on('log message', ({board_id, message}) => {
    socket.boardcast.emit('receive message', {io_board_id: board_id, message})
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
  console.log(`Example app listening at http://localhost:${port}`);
});
