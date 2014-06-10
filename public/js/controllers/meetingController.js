var serverUrl = "/",
    localStream, room, id, token;

function getParameterByName(name) {
    'use strict';
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

window.onload = function () {
    'use strict';
    
    $('#btn-end').click(function(){window.location.href = '/home';}   );
    
    try{
        var screen = getParameterByName('screen'),
            user = $('#user-connected-tf').val();

        localStream = Erizo.Stream({audio: true, video: true, data: true, screen: screen, videoSize: [640, 480, 640, 480]});
    } catch (error) {

        console.log('error');

    }

    var createToken = function(roomId, userName, role, callback) {

        var req = new XMLHttpRequest(),
            url = serverUrl + 'createToken/' + roomId,
            body = {username: userName, role: role};

        req.onreadystatechange = function () {
          if (req.readyState === 4) { //datos ya recibidos
            callback(req.responseText);
          }
        };

        req.open('POST', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(body));
    };

    var obtenerRoomPorUrl = function(){
            

        var rid = document.URL.split ('meeting/')[1];
        console.log('rid: '+ rid);
        return rid;

    };

    id = obtenerRoomPorUrl();


    createToken(id, user, 'presenter', function (response) {
        console.log('user: ' + user);
        token = response;
        console.log('token: ' + token);

        room = Erizo.Room({token: token});


        localStream.addEventListener('access-denied', function () {
            console.log('Access to webcam and microphone rejected');
        });

        localStream.addEventListener('access-accepted', function () {
            console.log('Access to webcam and microphone acepted');

            var subscribeToStreams = function (streams) {
                for (var index in streams) {
                  var stream = streams[index];
                  if (localStream.getID() !== stream.getID()) {
                    room.subscribe(stream);
                  }
                }
            };

            var unSubscribeToStreams = function (streams) {
                for (var index in streams) {
                  var stream = streams[index];
                  if (localStream.getID() !== stream.getID()) {
                    room.unsubscribe(stream);
                  }
                }
            };


            room.addEventListener('room-connected', function (roomEvent) {
                room.publish(localStream, {maxVideoBW: 300});
                console.log('Connected');
                subscribeToStreams(roomEvent.streams);
            });

            room.addEventListener('room-disconnected', function(roomEvent) {
                console.log('Disconnected');
            });

            room.addEventListener('stream-subscribed', function(streamEvent) {
                var stream = streamEvent.stream;
                
                addToGrid(stream.getID());
                stream.show(stream.getID());
                
                console.log('stream subcribed');
            });

            room.addEventListener('stream-added', function (streamEvent) {
                console.log('stream-added');
                var streams = [];
                streams.push(streamEvent.stream);
                subscribeToStreams(streams);
            });

            room.addEventListener('stream-removed', function (streamEvent) {
                var stream = streamEvent.stream;
                if (stream.elementID !== undefined) {
                
                    removeToGrid(stream.getID());
                    
                    room.unsubscribe(stream);
                }
                
            });

            room.connect();
            addToGrid('local');
            localStream.show('local');

        });

        localStream.init();

    });
};

var addToGrid = function(id){


    $('#video-container-meeting').css('border', 'none');
    var grid = document.getElementById('video-container-meeting'),
        newDiv = document.createElement('div'),
        newDiv2 = document.createElement('div');
        
    newDiv.setAttribute('id', id+'_container');
    newDiv.className = newDiv.className + ' grid_element_border';
        
    newDiv2.setAttribute('id', id);
    newDiv2.className = newDiv2.className + ' grid_element';
    newDiv.appendChild(newDiv2);
        
    grid.appendChild(newDiv);
    resizeGrid();
    
};

var removeToGrid = function(id){

    var grid = document.getElementById('video-container-meeting'),
        element = document.getElementById(id+'_container');
       
    grid.removeChild(element); 
    resizeGrid();
    

};

var resizeGrid = function() {

    var grid = document.getElementById('video-container-meeting'),
        nChilds = grid.childElementCount,
        c = Math.floor((nChilds-1)/3),
        r = (nChilds-1) % 3;
        console.log(nChilds);
        console.log();
        console.log();

    if (nChilds === 1) {
        grid.childNodes[0].setAttribute("style","width: 50%; height: 100%;");
    } else {
        var height = 100/(c+1);
        for(var i = 1; i <= nChilds; i++) {
            var row = Math.floor((i-1) / 3),
                width = 100/3;

            if (r === 0) {  // Two last rows, have two videos
                if (row > c - 2) { 
                    width = 50;
                }
                grid.childNodes[i-1].setAttribute("style", "width: " + width + "%; height: " + height + "%;");

            } else if (r === 1) {  // the last row has one video
                if (row === c) { 
                    width = 50;
                }
                grid.childNodes[i-1].setAttribute("style", "width: " + width + "%; height: " + height + "%;");

            } else {
                grid.childNodes[i-1].setAttribute("style", "width: " + width + "%; height: " + height + "%;");
            }
        }
    }
} ;

