
var LC = require('../lib/loginCert');

var httpsPort = 8001;

    var hostWithoutPort = function(url){
        'use strict';    
        var str = url;
        return str.split(':')[0];
    };
    
    var isValid = function(req){
        'use strict';
        return req.client.authorized;
    };
    
    var getSerialNumber = function(req){
        'use strict';
        var cert = req.connection.getPeerCertificate();
        console.log(cert);
        if (isValid(req)) {
            //var cert = req.connection.getPeerCertificate();
            if (cert && Object.keys(cert).length){
                var subject = cert.subject,
                    dni = subject.serialNumber;
                return dni;
            }
        }
        console.log('no valido:'+ req.client.authorizationError);
        return null;
        
    };

module.exports = function(app) {
    'use strict';
    //login cert
    app.get('/loginCertPatient', function(req, res){
        var host = hostWithoutPort(req.headers.host),
            dni = getSerialNumber(req);
        if (dni!==null){
            LC.certAutoLoginPatient(dni,function(o){
                if (!o){
                    res.send('error', 400);
                }    else{
                    req.session.user = o;
                    req.session.db = 0;
                    return res.redirect('https://'+host+':' + httpsPort + '/home');
                }
            });
        } else {
            res.redirect('https://'+host+':' + httpsPort + '/needCertificate');
        }
    });

    app.get('/loginCertDoctor', function(req, res){
        
        var host = hostWithoutPort(req.headers.host),
            dni = getSerialNumber(req);
        if (dni!==null){
            LC.certAutoLoginDoctor(dni,function(o){
                if (!o){
                    res.send('error', 400);
                }    else{
                    req.session.user = o;
                    req.session.db = 1;
                    return res.redirect('https://'+host+':' + httpsPort + '/home');
                }
            });
        } else {
            res.redirect('https://'+host+':' + httpsPort + '/needCertificate');
        }
    });

    app.get('/loginCertPlanner', function(req, res){
        var host = hostWithoutPort(req.headers.host),
            dni = getSerialNumber(req);
        if (dni!==null){
            LC.certAutoLoginPlanner(dni,function(o){
                if (!o){
                    res.send('error', 400);
                }    else{
                    req.session.user = o;
                    req.session.db = 2;
                    return res.redirect('https://'+host+':' + httpsPort + '/home');
                }
            });
        } else {
            res.redirect('https://'+host+':' + httpsPort + '/needCertificate');
        }
    });

    app.get('/loginCertAdmin', function(req, res){
        var host = hostWithoutPort(req.headers.host),
            dni = getSerialNumber(req);
        if (dni!==null){
            LC.certAutoLoginAdmin(dni,function(o){
                if (!o){
                    res.send('error', 400);
                }    else{
                    req.session.user = o;
                    req.session.db = 3;
                    return res.redirect('https://'+host+':' + httpsPort + '/home');
                }
            });
        } else {
            res.redirect('https://'+host+':' + httpsPort + '/needCertificate');
        }
    });

    app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });


};

