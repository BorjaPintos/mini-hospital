
var crypto     = require('crypto'),
    moment     = require('moment'),
    database = require('./dataBase'),
    dataBase = database.getDataBase(),
    
    DBPATIENTS = 0,
    DBDOCTORS = 1,
    DBPLANNERS = 2,
    DBADMINS = 3,

    START = 8.0,
    END = 14.00, //This will not in range
    DURATIONMINUTES=60;




var patients = dataBase.collection('patients'),
    doctors = dataBase.collection('doctors'),
    timetables = dataBase.collection('timetables'),
    accounts = dataBase.collection('patients'),

    getObjectTimetableId = function(id){
    'use strict';
    return timetables.db.bson_serializer.ObjectID.createFromHexString(id);
},

    findTimetableById = function(id, callback){
    'use strict';
    timetables.findOne({_id: getObjectTimetableId(id)},
        function(e, res) {
        if (e) {callback(e);}
        else {callback(null, res);}
    });
};



exports.addNewDate = function(newData, callback){
    'use strict';
    var data = {};
    findTimetableById(newData.timetableId, function(e,t){
        if (t){
            if (t.busy==true) {callback('date-taken');}
            else{
                if (newData.doctor !== t.doctor) {
                    callback('doctor-dist-timetable');
                }
                else{
                    t.patient=newData.patient;
                    t.roomId=newData.roomId;
                    t.busy=true;
                    timetables.save(t, {safe: true}, function(err) {
                        if (err) {callback(err);}
                        else {callback(null, t);}
                    });
                }
            }
        }
        else {
            callback('hour-no-exist');
        }
    });
    
};

exports.addNewTimetable = function(doctorDni, day, callback){
    'use strict';

    var createTimes = function(doctorDni, day , callback){
        var i,
            j=0,
            dayStart = new Date(day),
            dayEnd = new Date(day),
            minutes=0;
        for (i=START;i<END; minutes+=DURATIONMINUTES, j++, i=(minutes>=60)?i+1:i){
            if (minutes>=60) {
                minutes-=60;
            }
            data[j]={};
            data[j].doctor = doctorDni;
            data[j].patient = null;
            data[j].roomId=null;
            data[j].done=false;
            data[j].busy=false;
            data[j].start=dayStart;
            data[j].start.setHours(i, minutes);
            data[j].end=dayEnd;
            data[j].end.setHours(i, minutes+DURATIONMINUTES-1);
            timetables.insert(data[j], {safe: true}, callback);
            
        }

    };


    var data = [],
        timeStart = new Date(day),
        timeEnd = new Date(day);
    timeStart.setHours(START);
    timeEnd.setHours(END);
    timetables.findOne({doctor:doctorDni, 
                        start:{'$gte':timeStart, '$lte':timeEnd}}, 
                        function(e, t) {
        if (t) {
            callback('Timetable-exist');
        } else {
            doctors.findOne({dni:doctorDni}, function(e, d) {
                if (d){ //doctor existe en tabla de doctores
                    createTimes(doctorDni, day, callback);
                } else {
                    callback('Doctor-no-exist');
                }
            });
        }
    });
};


exports.getDoctorTimetable = function(doctorDni, db, start, callback){
    'use strict';
    var timeStart = new Date(start),
        timeEnd = new Date(timeStart);
    timeStart.setDate(1);
    timeEnd.setMonth(timeStart.getMonth()+1);

    timeStart.setDate(-7);
    timeEnd.setDate(+7);

    if (parseInt(db)===DBPATIENTS ){
    
        var now = new Date();
        now.setHours(now.getHours()-1);
        if (timeStart<now){
            timeStart = now;
        }
    
        timetables.find({doctor:doctorDni, 
                        busy:false, 
                        start:{'$gte':timeStart, '$lte':timeEnd}}, 
                        function(e, t) {
            if (e) {callback(e);}
              else {callback(null, t);}
    });
    }else if (parseInt(db)===DBPLANNERS){
        timetables.find({doctor:doctorDni, 
                        start:{'$gte':timeStart, '$lte':timeEnd}}, 
                        function(e, t) {
            if (e) {callback(e);}
              else {callback(null, t);}
        });
    }
    else {callback(null);}
};

exports.getDates = function(dni, db, start, callback){
    'use strict';

    var timeStart = new Date(start),
        timeEnd = new Date(timeStart);
    timeStart.setDate(1);
    timeEnd.setMonth(timeStart.getMonth()+1);

    timeStart.setDate(-7);
    timeEnd.setDate(+7);

    if (parseInt(db)===DBPATIENTS ){
        timetables.find({patient:dni, 
                        start:{'$gte':timeStart}, 
                        end:{'$lte':timeEnd}},
                        function(e, res) {
            if (e) {callback(e);}
            else {callback(null, res);}
        });
    } else {
        if (parseInt(db)===DBDOCTORS ){
            timetables.find({doctor:dni, 
                            start:{'$gte':timeStart}, 
                            end:{'$lte':timeEnd}},
                            function(e, res) {
                if (e) {callback(e);}
                else {callback(null, res);}
            });
        }
    }
};

exports.getOneDate = function(dni, roomId, callback){
    'use strict';

    timetables.findOne({doctor:dni, roomId:roomId},function(e, d) {
        if (e) {callback(e);}
        else {callback(null, d);}
    });
        
    
};


exports.dateDone = function(t, callback){
    'use strict';


    t.done = true;
    t.roomId = null;
    timetables.save(t, {safe: true}, function(err) {
        if (err) {callback(err);}
        else {callback(null, t);}
    });

};


