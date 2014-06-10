
function LoginController()
{

    $('#btn-patient').click(function(){window.location.href = 'https://'+window.location.hostname+':8002/loginCertPatient';});
    $('#btn-doctor').click(function(){window.location.href = 'https://'+window.location.hostname+':8002/loginCertDoctor';});
    $('#btn-planner').click(function(){window.location.href = 'https://'+window.location.hostname+':8002/loginCertPlanner';});
    $('#btn-admin').click(function(){window.location.href = 'https://'+window.location.hostname+':8002/loginCertAdmin';});

}
