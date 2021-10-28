const express = require('express')
const path = require('path')
const app = express()
const port = 3000
const router = require('./router')

app.use(router);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.get('/:boardID', function(req, res){
  res.sendFile(path.join(__dirname, '/board.html'))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

