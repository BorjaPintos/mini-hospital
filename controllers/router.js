
var AM = require('../lib/account-manager');
var DM = require('../lib/dates-manager');
var PR = require('../lib/permissions');
var N = require('../lib/external/nuve');

var DBPATIENTS = 0;
var DBDOCTORS = 1;
var DBPLANNERS = 2;

module.exports = function(app) {
    'use strict';
    app.get('/', function(req, res){

    // check if the user's credentials are saved in a cookie //
        if (req.cookies.dni === undefined ||
            req.cookies.pass === undefined ||
            req.cookies.db === undefined){
            res.render('login', 
                { title: 'Hello - Please Login To Your Account' });
        } else{
        // attempt automatic login //
            AM.autoLogin(req.cookies.dni, 
                            req.cookies.db, 
                            req.cookies.pass, function(o){
                if (o !== null){
                    req.session.user = o;
                    req.session.db = req.cookies.db;
                    res.redirect('/home');
                }    else{
                    res.render('login', 
                        { title: 'Hello - Please Login To Your Account' });
                }
            });
        }
    });

    app.post('/', function(req, res){
        AM.manualLogin(req.param('dni'), 
                        req.param('db'), 
                        req.param('pass'), function(e, o){
            if (!o){
                res.send(e, 400);
            }    else{
                req.session.user = o;
                req.session.db = req.param('db');
                if (req.param('remember-me') === 'true'){
                    res.cookie('dni', o.dni, { maxAge: 900000 });
                    res.cookie('db', req.session.db, { maxAge: 900000 });
                    res.cookie('pass', o.pass, { maxAge: 900000 });
                }
                res.send(o, 200);
            }
        });
    });

    app.get('/home', function(req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to login page //
            res.redirect('/');
        }   
        else{
            PR.isPatient(req.session.user.dni,req.session.db,function(e,o){
                if (o) {
                    res.render('homePatient', {
                        title : 'Control Panel',
                        udata : req.session.user
                    });
                }
                else {
                    PR.isDoctor(req.session.user.dni,
                                req.session.db,
                                function(e,o){
                        if (o) {
                            res.render('homeDoctor', {
                                title : 'Control Panel',
                                udata : req.session.user
                            });
                        }
                        else {
                            PR.isPlanner(req.session.user.dni,
                                            req.session.db,
                                            function(e,o){
                                if (o) {
                                    res.render('homePlanner', {
                                        title : 'Control Panel',
                                        udata : req.session.user
                                    });
                                }
                                else {
                                    PR.isAdmin(req.session.user.dni,
                                                req.session.db,
                                                function(e,o){
                                            if (o) {
                                                res.render('homeAdmin', {
                                                    title : 'Control Panel',
                                                    udata : req.session.user
                                                });
                                            }
                                            else {
                                                res.render('404', 
                                                    { title: 'Page Not Found'});
                                            }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    app.post('/home', function(req, res){
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } else {
            if (req.param('dni') !== undefined) {
            AM.updateAccount({
                name         : req.param('name'),
                dni         : req.session.user.dni,
                db            : req.session.db,
                pass        : req.param('pass')
            }, function(e, o){
                if (e){
                    res.send('error-updating-account', 400);
                }    else{
                    req.session.user = o;
                //    req.session.db; //no change
            // update the user's login cookies if they exists //
                    if (req.cookies.dni !== undefined &&
                        req.cookies.pass !== undefined && 
                        req.cookies.db !== undefined){
                        res.cookie('dni', o.dni, { maxAge: 900000 });
                        res.cookie('db', req.session.db, { maxAge: 900000 });
                        res.cookie('pass', o.pass, { maxAge: 900000 });    
                    }
                    res.send('ok', 200);
                }
            });
        }    else{
                if (req.param('logout') === 'true'){
                    res.clearCookie('dni');
                    res.clearCookie('db');
                    res.clearCookie('pass');
                    req.session.destroy(function(e){ res.send('ok', 200); });
                }
            }
        }
    });

    app.post('/signup', function(req, res){
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        }  
        else {
            PR.isAdmin(req.session.user.dni,req.session.db,function(e,o){
                if (o) {
                    AM.addNewAccount({
                        name     : req.param('name'),
                        dni     : req.param('dni'),
                        db        : req.param('db'),
                        doctor    : req.param('doctor'),
                        pass    : req.param('pass'),
                    }, function(e){
                        if (e){
                            res.send(e, 400);
                        }    else{
                            res.send('ok', 200);
                        }
                    });
                }
                else {

                    res.send('Unauthorized', 401);
                }
            });
        }
    });


    app.get('/default', function(req, res){

        AM.addNewAccount({
            name     : 'Admin',
            dni     : '12345678Z',
            db        : '3',
            pass    : 'mini-hospital',
        }, function(e){
            if (e){
                res.send(e, 400);
            }    else{
                res.send('ok', 200);
            }
        });

    });


    app.get('/getDoctors', function (req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } else{
            AM.getDoctors(function (e, doctors) {
                var first = true;
                res.write('{ "doctors" : [');
                doctors.each(function(err, item) {
                    var prefix = first ? '' : ', ';
                    if (item) {
                        res.write(prefix + 
                                '{"name": "' + item.name +
                                    '","dni":"' + item.dni + 
                                '"}');
                        first = false;
                    } else {
                      res.write(']}');
                      res.end();
                    }
                });
            });
        }
    });

    app.post('/getDates', function (req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } 
        else {
            DM.getDates(req.session.user.dni, 
                        req.session.db, 
                        req.param('start'),
                        function (e, dates) {
                var first = true;
                res.write('{ "dates" : [');
                dates.each(function(err, item) {
                    var prefix = first ? '' : ', ';
                    if (item) {
                        res.write(prefix + 
                                '{"roomId": "' + item.roomId +
                                '","start":"' + item.start +
                                '","end":"' + item.end +
                                '","busy":"' + item.busy +
                                '","done":"' + item.done +
                                '","patient":"' + item.patient +
                                '"}');
                        first = false;
                    } else {
                        res.write(']}');
                        res.end();
                    }
                });
            });
        }
    });

    app.post('/getPatientInfo', function (req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } 
        else {
            PR.isDoctor(req.session.user.dni, req.session.db,function(){
                AM.getPatientInfo(req.param('dni') ,function (e, patient) {
                    res.write('{ "patient" : [');
                    if (patient) {
                        res.write('{"name": "' + patient.name +
                                    '","dni":"' + patient.dni +
                                    '"}');
                    }
                    res.write(']}');
                    res.end();
                });        
            });

        }
    });

    app.post('/getTimeTable', function (req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } else {
            var doc;
            if (parseInt(req.session.db)===DBPLANNERS) {
                doc = req.param('doctorDni');
            }
            else {
                if (parseInt(req.session.db)===DBPATIENTS) {
                    doc = req.session.user.doctor;
                }
            }
            DM.getDoctorTimetable(doc, 
                                req.session.db, 
                                req.param('start') , 
                                function (e, timetables) {
                var first = true;
                res.write('{ "timetables" : [');
                timetables.each(function(err, item) {
                    var prefix = first ? '' : ', ';
                    if (item) {
                        res.write(prefix + '{"_id": "' + item._id +
                                            '","start":"' + item.start + 
                                            '","end":"'+ item.end+
                                            '","busy":"'+ item.busy+
                                            '"}');
                        first = false;
                    } else {
                      res.write(']}');
                      res.end();
                    }
                });
            });
        }
    });

    app.post('/newTimetable', function(req, res){
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } 
        else {
            PR.isPlanner(req.session.user.dni,
                            req.session.db,
                            function(e,o){
                if (o) {
                    DM.addNewTimetable(req.param('doctorDni'), 
                                        req.param('day'),
                                        function(e){
                            if (e){
                                res.send(e, 400);
                            }    else{
                                res.send('ok', 200);
                            }
                        });
                }
                else {
                    res.send('Unauthorized', 401);
                }
            });
        }
    });

    app.post('/order', function(req, res){
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } else {
            var error = function(){
                console.log('error createRoom p2p');
                res.send('error-create-room',400);
            };

            N.API.createRoom(req.session.user.dni+req.session.user.doctor, 
                            function (roomID) {

                DM.addNewDate({
                    patient     : req.session.user.dni,
                    doctor         : req.session.user.doctor,
                    roomId        : roomID._id,
                    done        : false,
                    timetableId : req.param('id'),
                },function(e){
                    if (e){
                        N.API.deleteRoom(roomID._id, function(result) {
                            console.log('Room ' + roomID._id + ' deleted');
                        });
                        res.send(e, 400);
                    }else{
                        res.send('ok', 200);
                    }
                });
                console.log('Patient: ' + req.session.user.dni + 
                            ' Doctor:' + req.session.user.doctor + 
                            ' Created roomid: ' + roomID._id + 
                            ' idDate: ' + req.param('id'));
            },error,{p2p: true});
        }
    });

    app.get('/room/:room', function(req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } 
        else {
            PR.isAuthorized( req.session.db,
                            req.session.user.dni,
                            req.params.room,
                            function(e , t) {
                if (t) {
                    var now = new Date();
                    if (t.end>=now && t.start<=now){ 
                        res.render('room', {
                                    title : 'Room',
                                    udata : req.session.user
                                });
                    }else {
                        res.render('notyet', {
                                    title : 'Room',
                                    udata : req.session.user
                        });
                    }
                }else{
                    res.render('404', { title: 'Page Not Found'});
                }
            });
        }
    });

    app.get('/deleteRoom/:room', function (req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } 
        else {
            var room = req.params.room;

            N.API.getRoom(room, function(resp) {
                N.API.getUsers(room, function(users) {
                    var usersList = JSON.parse(users);
                    if (usersList.length===0) {
                        DM.getOneDate(req.session.user.dni, 
                                        room, 
                                        function (e, d) {
                            if (d){
                                var now = new Date();
                                if (d.start>now) {
                                    res.render('roomDeleted', 
                                        { title: 'Deleting Room', 
                                            msg : 'Date-does-not-start'});
                                }
                                else {
                                    PR.isDoctor(req.session.user.dni,
                                                req.session.db,
                                                function(e,o){
                                        if (o){
                                            if (d.doctor===req.session.user.dni){
                                                DM.dateDone(d,function (e){
                                                    if (e){ res.send(e,400);}
                                                    else {
                                                        N.API.deleteRoom(room, 
                                                        function(result) {
                                                             console.log('Room: '+room +' was deleted');    
                                                             res.render('roomDeleted', 
                                                             { title: 'Deleting Room', 
                                                                 msg : 'Ok'});
                                                        });
                                                    }
                                                });
                                            }else{
                                                res.render('404', { title: 'Page Not Found'});
                                            }
                                        } else {
                                            res.render('404', { title: 'Page Not Found'});
                                        }
                                    });
                                }
                            }
                            else{
                                res.render('404', { title: 'Page Not Found'});
                            }
                        });
                    }
                    else{
                        res.render('roomDeleted', 
                        { title: 'Deleting Room', 
                        msg : 'People-still'});
                    }    
                }); 
            }, function(){res.render('404', { title: 'Page Not Found'});});
        }
    });


    app.post('/createToken/:room', function (req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } else {
            var room = req.params.room,
                username = req.body.username,
                role = req.body.role;
            N.API.createToken(room, username, role, function (token) {
                console.log('token created ' + token);
                res.send(token);
            });
        }
    });

    app.get('/getRooms/', function (req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } else {
            N.API.getRooms(function (rooms) {
                res.send(rooms);
            });
        }
    });

    app.get('/getUsers/:room', function (req, res) {
        if (req.session.user === undefined){
            // if user is not logged-in redirect back to not found page //
            res.render('404', { title: 'Page Not Found'});
        } else {
            var room = req.params.room;
            N.API.getUsers(room, function (users) {
                res.send(users);
            });
        }
    });

    app.get('/needCertificate', function(req, res) { 
            res.render('needCertificate', 
            { title: 'You need a Certificate'}); 
    });

    app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });


};

