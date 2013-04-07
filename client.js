//hardcode, put on cloud server later
var markers = {} //dictionary of clint_id keys and [lat, lon] values
var con = new WebSocket ("ws://10.22.35.212:8080")


con.onmessage = function(message){
    var stringMessage = message.data;
    //console.log(message.data);
    message =JSON.parse(message.data);
    if(message.type == "location"){
       // console.log(" Latitude: " + message.location[0] + ", Longitude: " + message.location[1]); 
        if (markers[message.who] == undefined){
            markers[message.who] = [message.location[0], message.location[1], message.host]  //[lat, lon, host boolean]
        }
        else {
            markers[message.who][0] = message.location[0];
            markers[message.who][1] = message.location[1];
        }
        placeMarkers(markers, map);
    }
}

function placeMarkers(markerDict, roomMap) {
    if (roomMap == undefined){return}
    for (var clientId in markerDict) {
        //console.log("connected to: "+clientId);
        lat = markers[clientId][0]
        lon = markers[clientId][1];
        //console.log("Latitude: "+lat+" Longitude: "+lon);
        latlon = new google.maps.LatLng(lat, lon);
        if (markers[clientId][3] == undefined){
            markers[clientId].push(new google.maps.Marker({position:latlon, map:roomMap, title:clientId}));
            if (markers[clientId][2]){
                markers[clientId][3].setIcon('Host.png');
            }
            else{
                markers[clientId][3].setIcon('Person.png');
            }
            console.log("onCreate");
        }
        else{
            markers[clientId][3].setPosition(latlon);
        }
    }


}

function joinRoom(roomId) {
    var host = false;  //joining a room, not a host
    if (roomId == undefined) {
        roomId = makeRoomId();  //creating a new room, they are a host
        host = true;
    }
    var linkcontainer = document.getElementById("linkcontainer");
    var insert = document.createElement("a");
    insert.setAttribute("href", "http://10.22.35.212:8000?room_id=" + roomId);
    insert.innerHTML="http://10.22.35.212:8000?room_id=" + roomId;
    insert.setAttribute("id", "reflink");
    linkcontainer.appendChild(insert);
    con.send(JSON.stringify({type: "join", roomId: roomId, host: host}));
}

function makeRoomId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < 5; i++ ){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function updateLocation(location) {
    con.send(JSON.stringify({type: "location", location: location}))  
}

function getQueryStrings() { 
  var assoc  = {};
  var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
  var queryString = location.search.substring(1); 
  var keyValues = queryString.split('&'); 

  for(var i in keyValues) { 
    var key = keyValues[i].split('=');
    if (key.length > 1) {
      assoc[decode(key[0])] = decode(key[1]);
    }
  } 

  return assoc; 
} 
var room_id=getQueryStrings()['room_id']
if (room_id != undefined){
  joinRoom(room_id.substring(0, room_id.length-1));
  setInterval(function(){getLocation()}, 500);
  document.getElementByclass("location").style.visibility="hidden";
}
