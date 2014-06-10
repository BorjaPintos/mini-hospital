
var    database = require('./dataBase'),
    dataBase = database.getDataBase();

exports.selectDataBase = function(db){
    'use strict';
    /*
    if (db == BDPATIENTS) return dataBase.collection('patients');
    if (db == BDDOCTORS) return dataBase.collection('doctors');
    if (db == BDPLANNERS) return dataBase.collection('planners');
    if (db == BDADMINS) return dataBase.collection('admins');
    */
    /*
    No se porque no me deja poner directamente el nombre de la variable global
    */
    var select = {
        0: function () {
                return dataBase.collection('patients');
        },
        1: function () {
                return dataBase.collection('doctors');
        },
        2: function () {
                return dataBase.collection('planners');
        },
        3: function () {
                return dataBase.collection('admins');
        }
    };
    if (typeof select[db] !== 'function') {
          throw new Error('Invalid action.');
    }
    return select[parseInt(db)]();

};
