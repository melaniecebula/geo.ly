var ws= require('ws')


//hardcode, put on cloud server later
var con = new WebSocket ("ws://10.22.35.212:8080")


function joinRoom(roomId) {
    if (roomId == undefined) {
        roomId = makeRoomId();
    }
    con.send(JSON.stringify({type: "join", roomId: roomId});
}

function makeRoomId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function updateLocation(location) {
    con.send(JSON.stringify({type: "location", }))
}