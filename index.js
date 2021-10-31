const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

