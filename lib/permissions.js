

var    DBPATIENTS = 0,
    DBDOCTORS = 1,
    DBPLANNERS = 2,
    DBADMINS = 3,
    
    database = require('./dataBase'),
    dataBase=database.getDataBase(),
    
    patients = dataBase.collection('patients'),
    doctors = dataBase.collection('doctors'),
    planners = dataBase.collection('planners'),
    admins = dataBase.collection('admins'),
    timetables = dataBase.collection('timetables'),
    accounts;

exports.isAdmin = function(dni,bd,callback){
    'use strict';
    if (parseInt(bd)!==DBADMINS){
         callback(null,null);
    }
    else{
        admins.findOne({dni:dni}, function(e, o){
            if (o === null){
                callback(null,null);
            }
            else{
                callback(null,o);
            }
        });
    }
};

exports.isPlanner = function(dni,bd,callback){
    'use strict';
    if (parseInt(bd)!==DBPLANNERS){
         callback(null,null);
    }
    else{
        planners.findOne({dni:dni}, function(e, o){
            if (o === null){
                callback(null,null);
            }
            else{
                callback(null,o);
            }
        });
    }
};

exports.isPatient = function(dni,bd,callback){
    'use strict';
    if (parseInt(bd)!==DBPATIENTS){
         callback(null,null);
    }
    else{
        patients.findOne({dni:dni}, function(e, o){
            if (o === null){
                callback(null,null);
            }
            else{
                callback(null,o);
            }
        });
    }
};

exports.isDoctor = function(dni,bd,callback){
    'use strict';
    if (parseInt(bd)!==DBDOCTORS){
         callback(null,null);
    }
    else{
        doctors.findOne({dni:dni}, function(e, o){
            if (o === null){
                callback(null,null);
            }
            else{
                callback(null,o);
            }
        });
    }
};

exports.isAuthorized = function(db, dni, roomId, callback){
    'use strict';
    timetables.findOne({roomId:roomId}, function(e, r) {
        if (r){
                if (parseInt(db)===DBPATIENTS ){
                    if (r.patient === dni) {callback(null, r);}
                    else {callback('Patient-no-Authorized');}
                } else {
                    if  (parseInt(db)===DBDOCTORS ){
                        if (r.doctor === dni) {callback(null, r);}
                        else {callback('Doctor-no-Authorized');}
                    }
                }
        }else{
            callback('Room-no-exist');
        }
    });
};

