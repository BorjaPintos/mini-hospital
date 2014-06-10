
var crypto     = require('crypto'),
    moment     = require('moment'),
    selectdb = require('./selectDB'),
        
    BDPATIENTS = 0,
    BDDOCTORS = 1,
    BDPLANNERS = 2,
    BDADMINS = 3,

    database = require('./dataBase'),
    dataBase=database.getDataBase();

var patients = dataBase.collection('patients'),
    doctors = dataBase.collection('doctors'),
    planners = dataBase.collection('planners'),
    admins = dataBase.collection('admins'),
    accounts;

/* private encryption & validation methods */
var generateSalt = function(){
    'use strict';
    var set = 
        '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
        salt = '',
        i,
        p;
    for (i = 0; i < 10; i++) {
        p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
};

var sha512 = function(str) {
    'use strict';
    return crypto.createHash('sha512').update(str).digest('hex');
};

var saltAndHash = function(pass, callback){
    'use strict';
    var salt = generateSalt();
    callback(salt + sha512(pass + salt));
};

var validatePassword = function(plainPass, hashedPass, callback){
    'use strict';
    var salt = hashedPass.substr(0, 10),
        validHash = salt + sha512(plainPass + salt);
    callback(null, hashedPass === validHash);
};

/* auxiliary methods */

var getObjectId = function(id){
    'use strict';
    return accounts.db.bson_serializer.ObjectID.createFromHexString(id);
};


var findById = function(id, callback){
    'use strict';
    accounts.findOne({_id: getObjectId(id)},
        function(e, res) {
        if (e) {callback(e);}
        else {callback(null, res);}
    });
};

/* login validation methods */

exports.autoLogin = function(dni, db, pass, callback){
    'use strict';
    accounts = selectdb.selectDataBase(db);
    accounts.findOne({dni:dni}, function(e, o) {
        if (o){
            o.pass === pass ? callback(o) : callback(null);
        }    else{
            callback(null);
        }
    });
};

exports.manualLogin = function(dni, db, pass, callback){
    'use strict';
    accounts = selectdb.selectDataBase(db);
    accounts.findOne({dni:dni}, function(e, o) {
        if (o === null){
            callback('dni-not-found');
        }    else{
            validatePassword(pass, o.pass, function(err, res) {
                if (res){
                    callback(null, o);
                }    else{
                    callback('invalid-password');
                }
            });
        }
    });
};

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback){
    'use strict';
    accounts = selectdb.selectDataBase(newData.db, dataBase);
    var data = {};
    accounts.findOne({dni:newData.dni}, function(e, o) {
        if (o){
            callback('dni-taken');
        }    else{
            if (parseInt(newData.db) === BDPATIENTS) {    
                doctors.findOne({dni:newData.doctor}, function(e, o){
                    if (o){
                        data.name=newData.name;
                        data.dni = newData.dni;
                        data.doctor = o.dni;
                        saltAndHash(newData.pass, function(hash){
                            data.pass=hash;
                            // append date stamp when record was created //
                            data.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                            accounts.insert(data, {safe: true}, callback);
                        });
                    }else {
                        callback ('doctor-no-exist');
                    }
                });
            }
            else {
                data.name=newData.name;
                data.dni = newData.dni;
                saltAndHash(newData.pass, function(hash){
                    data.pass=hash;
                    // append date stamp when record was created //
                    data.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                    accounts.insert(data, {safe: true}, callback);
                });
            }
        }
    });

};

exports.updateAccount = function(newData, callback){
    'use strict';
    accounts = selectdb.selectDataBase(newData.db, dataBase);
    accounts.findOne({dni:newData.dni}, function(e, o){
        o.name = newData.name;
        if (newData.pass === ''){
            accounts.save(o, {safe: true}, function(err) {
                if (err) {callback(err);}
                else {callback(null, o);}
            });
        }    else{
            saltAndHash(newData.pass, function(hash){
                o.pass = hash;
                accounts.save(o, {safe: true}, function(err) {
                    if (err) {callback(err);}
                    else {callback(null, o);}
                });
            });
        }
    });
};

/* accounts lookup methods */

exports.deleteAccount = function(id, db, callback){
    'use strict';    
    accounts = selectdb.selectDataBase(db);
    accounts.remove({_id: getObjectId(id)}, callback);
};

exports.getDoctors = function (callback){
    'use strict';
    doctors.find({},function(e, res) {
        if (e) {callback(e);}
        else {callback(null, res);}
    });

};

exports.getPatientInfo = function(dni,callback){
    'use strict';
    patients.findOne({dni:dni}, function(e, o){
        if (o === null){
            callback(null,null);
        }
        else{
            callback(null,o);
        }
    });
    
};


