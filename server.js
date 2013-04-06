var ws= require('ws')
var server = new ws.Server({port: 8080})

var rooms = {}

server.on('connection', function(con){
  console.log("Hello world!");
  var id = makeid();
  con.send(id);
  con.on("message", function(message){
    var stringMessage = message;
    message=JSON.parse(message);
    console.log(message.type);
    if (message.type == 'join'){
      joinRoom(message, con);
    }
    else if (message.type =='location'){
      for (var i = 0; i < con.room.length; i++){
        if (con.room[i]==con){
          continue;
        }
        con.room[i].send(stringMessage);
      }
    }
    else {
      con.send('You fucked up somewhere.');
    }
  })
})

function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function joinRoom(message, con){
  if (rooms[message.room_id] == undefined){
    rooms[message.room_id] = [];
  }
  rooms[message.room_id].push(con);
  con.room = rooms[message.room_id];
  console.log("join success.");
}