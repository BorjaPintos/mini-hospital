/**
 * Module dependencies.
 */

var express = require('express'),

    routes = require('./controllers/router'),
    routesHttp = require('./controllers/routerHttp'),
    routesCert = require('./controllers/routerCert'),
    
    path = require('path'),
    
    config = require('../licode/licode_config'),
    
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    
    N = require('./lib/external/nuve');



//Server HTTPS
var options = {
    key: fs.readFileSync(path.join('./artifacts/keys/private/mini-hospital-key.pem')),
    cert: fs.readFileSync(path.join('./artifacts/keys/mini-hospital-cert.pem')),
};

var app = express(),
    session = express.session({ secret: 'super-duper-secret-secret' });
// all environments
app.set('port', 8001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(session);
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

routes(app);

https.createServer(options, app).listen(app.get('port'), function(){
    'use sctric';
    console.log('Express server https listening on port ' + app.get('port'));
});


//Server Certificates
var optionsCert = {
    key: fs.readFileSync(path.join('./artifacts/keys/private/mini-hospital-key.pem')),
    cert: fs.readFileSync(path.join('./artifacts/keys/mini-hospital-cert.pem')),
    ca: [fs.readFileSync('./artifacts/ca/ACRAIZ-SHA1-PEM.crt')],
    requestCert: true,
};

var appCert = express();
appCert.set('port', 8002);
appCert.set('views', path.join(__dirname, 'views'));
appCert.set('view engine', 'jade');
appCert.use(express.bodyParser());
appCert.use(express.methodOverride());
appCert.use(express.cookieParser());
appCert.use(session);
appCert.use(appCert.router);
routesCert(appCert);
https.createServer(optionsCert, appCert).listen(appCert.get('port'), function(){
    'use strcit';
console.log('Express server https_cert listening on port ' + appCert.get('port'));
});


//Server HTTP
var appHttp = express();
appHttp.set('port', 8000);
appHttp.use(appHttp.router);

routesHttp(appHttp);

http.createServer(appHttp).listen(appHttp.get('port'), function(){
    'use strict';
    console.log('Express server http listening on port ' + appHttp.get('port'));
});


//For delete all rooms, uncomment de last line
N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://localhost:3000/');

function deleteAllRooms() {
    'use strict';
    N.API.getRooms(function (roomList) {
        var rooms = JSON.parse(roomList);
        console.log(rooms.length);
        if (rooms.length > 0) {
        N.API.deleteRoom(rooms[0]._id, function(result) {
            console.log('Room ' + rooms[0].name + ' deleted');
            // Recursive call
            deleteAllRooms();
            });
        } else {
            return;
        }
    });
}

//deleteAllRooms();


