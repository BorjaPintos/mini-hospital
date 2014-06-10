var AM = require('../lib/account-manager');

var httpsPort = 8001;

    var hostWithoutPort = function(url){
        'use strict';    
        var str = url;
        return str.split(':')[0];
    };

module.exports = function(app) {
    'use strict';
    app.get('*', function(req, res) { 
        var host = hostWithoutPort(req.headers.host);
        console.log('http rediret to ' + 'https://'+host+':' + httpsPort);
        return res.redirect('https://'+host+':' + httpsPort); 
    });


};

