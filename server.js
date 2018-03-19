const socket = require("socket.io");
const express = require("express");
var path = require('path');

var app = express();
var web = express();
web.use(express.static(__dirname + '/'));

web.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
web.listen(4000)

var server = app.listen(5000, () => {
  console.log("<<< WS listening on port 3000 >>>");
});

var io = socket(server);

io.on("connection", socket => {
  console.log("socket connection made", socket.id);

  socket.on("ship", data => {
    io.sockets.emit("ship", data);
    console.log(data);
  });
});

