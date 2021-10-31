const express = require('express')
const path = require('path')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const port = 3000
const router = require('./router')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/client/static')))
app.use('/api', router);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/client/index.html'));
})

app.get('/:boardID', function(req, res){
  res.sendFile(path.join(__dirname, '/client/board.html'))
})

// socket.io functions
io.on('connection', socket => {
  console.log('a user connected')
  socket.on('connected to', board_id => {
    console.log(`user is connected to board ${board_id}`)
  })
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

