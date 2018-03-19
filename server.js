const socket = require('socket.io')
const express = require('express')
var app = express()

  
  var server = app.listen(3000, ()=>{
      console.log('<<< Listening on port 3000 >>>')
  })

var io = socket(server);

io.on('connection', socket=>{
    console.log('socket connection made', socket.id)

    socket.on('ship',data=>{
        io.sockets.emit('ship', data)
        console.log(data)
    })
})