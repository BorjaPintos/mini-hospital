var    MongoDB = require('mongodb').Db,
    Server     = require('mongodb').Server,
    moment     = require('moment'),
    selectdb = require('./selectDB'),
    
    dbPort     = 27017,
    dbHost     = 'localhost',
    dbName     = 'mini-hospital',
    
     dataBase = new MongoDB(dbName, 
                    new Server(dbHost, dbPort, {auto_reconnect: true}),
                    {w: 1});

dataBase.open(function(e, d){
    'use strict';
    if (e) {
        console.log(e);
    }else{
        console.log('connected to database :: ' + dbName);
    }
});

exports.getDataBase = function(){

    return dataBase;

}
