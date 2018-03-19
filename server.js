const socket = require("socket.io");
const express = require("express");
var path = require('path');

var app = express();

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.listen(4000,()=>{
    console.log("<<< Static Host listening on port 4000 >>>");  
})

var server = app.listen(5000, () => {
  console.log("<<< WS listening on port 5000 >>>");
});

var io = socket(server);

io.on("connection", socket => {
  console.log("socket connection made", socket.id);

  socket.on("ship", data => {
    io.sockets.emit("ship", data);
    console.log(data);
  });
});

