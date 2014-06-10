
var selectdb = require('./selectDB'),
    accounts,
    DBPATIENTS = 0,
    DBDOCTORS = 1,
    DBPLANNERS = 2,
    DBADMINS = 3;


var certAutoLogin = function(dni, db, callback){
    'use strict';
    accounts = selectdb.selectDataBase(db);
    accounts.findOne({dni:dni}, function(e, o) {
        if (o){
            callback(o);
        }    else{
            callback(null);
        }
    });
};

/*module*/

exports.certAutoLoginPatient = function(dni, callback){
    'use strict';
    certAutoLogin(dni,DBPATIENTS,callback);

};

exports.certAutoLoginDoctor = function(dni, callback){
    'use strict';
    certAutoLogin(dni,DBDOCTORS,callback);

};

exports.certAutoLoginPlanner = function(dni, callback){
    'use strict';
    certAutoLogin(dni,DBPLANNERS,callback);

};

exports.certAutoLoginAdmin = function(dni, callback){
    'use strict';
    certAutoLogin(dni,DBADMINS,callback);

};
