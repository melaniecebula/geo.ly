var ws= require('ws')
var server = new ws.Server({port: 8080})

var rooms = {}

server.on('connection', function(con) {
  console.log("Hello world!");
  con.id = makeId();
  con.on("message", function(message) {
    var stringMessage = message;
    message=JSON.parse(message);
    console.log(message.type);
    if (message.type == 'join') {
      joinRoom(message, con);
    }
    else if (message.type =='location') {
      sendLocation(message, con);
    }
    else {
      con.send(JSON.stringify('You fucked up somewhere.'));
    }
  })
})

function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function joinRoom(message, con) {
  if (rooms[message.roomId] == undefined) {
    rooms[message.roomId] = [];
  }
  rooms[message.roomId].push(con);
  con.room = rooms[message.roomId];
  con.host = message.host;
  console.log("join success.");
  console.log("Is the user a host?: " + con.host);
}

//Function for broadcasting location to other clients. message includes location
//and con is the connection that is sending its location.
function sendLocation(message, con) {
  for (var i = 0; i < con.room.length; i++) {
    if (con.room[i] == con) {
      continue;
    }
    message.who = con.id;
  con.room[i].send(JSON.stringify(message));
  } 
}