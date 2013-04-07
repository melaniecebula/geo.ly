var ws= require('ws')
var server = new ws.Server({port: 8080})

var rooms = {}

server.on('connection', function(con) {
  console.log("Hello world!");
  con.id = makeId();
  con.on("message", function(message) {
    var stringMessage = message;
    message=JSON.parse(message);
    if (message.type == 'join') {
      joinRoom(message, con);
    }
    else if (message.type =='location') {
      sendLocation(message, con);
    }
    else if (message.type == "leave"){
      leaveRoom(message, con);
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
    var secondPerson;
    var set = false;
  }
  rooms[message.roomId].push(con);
  con.room = rooms[message.roomId];
  con.isHost = message.isHost;
  if(!con.isHost && !set){
        set = true;
        secondPerson = con.id;
        console.log(secondPerson);
        emitSecond(secondPerson, con);}
  console.log(con.id+" joined "+con.room);
  con.send(JSON.stringify({type: "id", id: con.id, second: secondPerson}));
  console.log("Is the user a host?: " + con.isHost);
}

function leaveRoom(message, con){
  message.who = con.id;
  broadcast(message, con);
  con=undefined;
}

//Function for broadcasting location to other clients. message includes location
//and con is the connection that is sending its location.
function sendLocation(message, con) {
  message.who = con.id;

  message.isHost = con.isHost;
  if (con.isHost){
    message.host=con.id;
  }
  broadcast(message, con); 
}
function broadcast(message, con){
  for (var i = 0; i < con.room.length; i++) {
  con.room[i].send(JSON.stringify(message));
  }
}

function emitSecond(second, con){
  broadcast({type: 'second', other: second}, con);
}
process.on('uncaughtException', function (exception) {
   // handle or ignore error
  });
