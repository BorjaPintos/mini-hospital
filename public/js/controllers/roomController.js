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
            

        var rid = document.URL.split ('room/')[1];
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
                stream.show('video-container2');
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
                if (localStream.getID() === stream.getID()){
                    room.unpublish(localStream);
                    room.disconnect();
                }
                room.unsubscribe(stream);
            });

            room.connect();
            localStream.show('video-container');

        });

        localStream.init();

    });
};
