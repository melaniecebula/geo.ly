//hardcode, put on cloud server later
var markers = {} //dictionary of clint_id keys and [lat, lon] values
var con = new WebSocket ("ws://10.22.35.212:8080")
var secondPerson

con.onmessage = function(message){
    var stringMessage = message.data;
    message =JSON.parse(message.data);
    if(message.type == "location"){
        if(message.isHost){
            host=message.host;
        }
        if (markers[message.who] == undefined){
            markers[message.who] = [message.location[0], message.location[1], message.isHost]  //[lat, lon, host boolean]
        }
        else {
            markers[message.who][0] = message.location[0];
            markers[message.who][1] = message.location[1];
        }
        placeMarkers(markers, map);
    }
    else if (message.type == "id"){
        console.log(message.id);
        con.id = message.id;
    }
    else if (message.type == 'second'){
        console.log(message.other);
        secondPerson=message.other;
    }
    else if (message.type == "leave"){
        console.log("onClose");
        delete markers[message.who];
    }
}

con.onopen = function() {
  var room_id = getQueryStrings()['room_id']
  if (room_id != undefined) {
    joinRoom(room_id.substring(0, room_id.length - 1));
    setInterval(function(){getLocation()}, 500);
  } 
}
window.onbeforeunload=function(){
    leaveRoom(con);
}

function getHeading() {
    var hostlat = markers[host][0];
    var hostlon = markers[host][1];
    var hostlatlon = new google.maps.LatLng(hostlat,hostlon);
    if(con.id == host){
        var lat2 = markers[secondPerson][0];
        var lon2 = markers[secondPerson][1];
        var latlon2 = new google.maps.LatLng(lat2,lon2);
        heading = google.maps.geometry.spherical.computeHeading(hostlatlon, latlon2);
    }
    else{
        var lat1 = markers[con.id][0];
        var lon1 = markers[con.id][1];
        var latlon1 = new google.maps.LatLng(lat1, lon1);
        heading = google.maps.geometry.spherical.computeHeading(latlon1, hostlatlon);
    }
    var headingInsert = document.createElement("b");
    headingInsert.innerHTML = heading;
    document.getElementById("headingcontainer").appendChild(headingInsert);
}

function placeMarkers(markerDict, roomMap) {
    if (roomMap == undefined){return}
    for (var clientId in markerDict) {
        lat = markers[clientId][0]
        lon = markers[clientId][1];
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
    var isHost = false;  //joining a room, not a host
    if (roomId == undefined) {
        roomId = makeRoomId();  //creating a new room, they are a host
        isHost = true;
    }

    var linkcontainer = document.getElementById("linkcontainer");
    linkcontainer.innerHTML += "Send this link to your friends!</br>";
    var insert = document.createElement("a");
    insert.setAttribute("href", "http://10.22.35.212:8000?room_id=" + roomId);
    insert.innerHTML = "http://10.22.35.212:8000?room_id=" + roomId;
    insert.setAttribute("id", "reflink");
    linkcontainer.appendChild(insert);
    document.getElementById("mytable").removeChild(document.getElementById("default"));
    var smalltitle= document.createElement("h1");
    smalltitle.setAttribute("id", "smalltitle");
    smalltitle.innerHTML = "geo.ly";
    smalltitle.style.cssText+= document.getElementById("mytable").offsetHeight+";";
    linkcontainer.appendChild(smalltitle);
    con.send(JSON.stringify({type: "join", roomId: roomId, isHost: isHost}));
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

function leaveRoom(){
    con.send(JSON.stringify({type:"leave"}));
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