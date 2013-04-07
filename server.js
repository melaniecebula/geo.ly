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
  console.log(con.id+" joined "+con.room);
  console.log("Is the user a host?: " + con.host);
}

//Function for broadcasting location to other clients. message includes location
//and con is the connection that is sending its location.
function sendLocation(message, con) {
  for (var i = 0; i < con.room.length; i++) {
    message.who = con.id;

    message.host = con.host;
  con.room[i].send(JSON.stringify(message));
  } 
process.on('uncaughtException', function (exception) {
   // handle or ignore error
  });
}