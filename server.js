const socket = require("socket.io");
const express = require("express");
var path = require("path");

var app = express();

app.use(express.static(__dirname + "/"));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});
app.listen(4000, () => {
  console.log("<<< Static Host listening on port 4000 >>>");
});

var server = app.listen(5000, () => {
  console.log("<<< WS listening on port 5000 >>>");
});

var io = socket(server);
const ships = {};
io.on("connection", socket => {
  console.log("socket connection made", socket.id);

  socket.on("shipStatus", data => {
    ships[data.id] = data;

    io.sockets.emit("gameState", { status: ships });
    console.log(ships);
  });

  socket.on("disconnect", function() {
    delete ships[socket.id];
  });
});
