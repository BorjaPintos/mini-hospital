
function HomeAdminController()
{

    var name,
        dni,
        av = new AccountValidator(),
        that = this,
        $now;
        
// handle user logout //
    $('#btn-logout').click(function(){ that.attemptLogout(); });


    $('#radio-cg').click(function(){
         if  ($('.radio-tf').filter(':checked').val() == 0){
            $('#doctors-cg').slideDown();
        }
        else {$('#doctors-cg').slideUp();}
    });


//handle account settings
    $('#account-settins').click(function(){ 
        that.refreshScreen('#account-form',that.onClickSettings);
    });


//handle create account
    $('#create-account').click(function(){
        that.refreshScreen('#account-form',that.onClickCreate);
    });


    $('#account-form-btn1').click(function(){


        if (av.validateForm())
        {
            $.ajax({
                url: '/signup',
                type: 'POST',
                data: { 
                        name: $('#name-tf').val(),
                        dni: $('#dni-tf').val(),
                        db: $('.radio-tf').filter(':checked').val(),
                        doctor: $('.selectpicker').val(),
                        pass: $('#pass-tf').val()
                      },
                success: function(data){
                     that.onCreateSuccess();
                },
                error: function(jqXHR){
                    console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
                    if (jqXHR.responseText === 'dni-taken'){
                        av.showInvalidDni();
                    }if (jqXHR.responseText === 'doctor-no-exist'){
                        av.showInvalidDoctor();
                    }
                }
            });
        }
        
    });

// handle account deletion //
    $('.modal-confirm .submit').click(function(){ });



    this.attemptLogout = function()
    {
        var that = this;
        $.ajax({
            url: '/home',
            type: 'POST',
            data: {logout : true},
            success: function(data){
                name='';
                dni='';
                 that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
            },
            error: function(jqXHR){
                console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
            }
        });
    };

    this.showLockedAlert = function(msg){
        $('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
        $('.modal-alert .modal-header h3').text('Success!');
        $('.modal-alert .modal-body p').html(msg);
        $('.modal-alert').modal('show');
        $('.modal-alert button').click(function(){
            window.location.href = '/';
        });
        setTimeout(function(){window.location.href = '/';}, 3000);
    }
}

HomeAdminController.prototype.refreshScreen = function(aparece, callback)
{
    var $portlet = $(aparece);
    $now.fadeOut(function(){
        callback();
        $portlet.fadeIn();
    });
    

};


HomeAdminController.prototype.onUpdateSuccess = function()
{
    $('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
    $('.modal-alert .modal-header h3').text('Success!');
    $('.modal-alert .modal-body p').html('Your account has been updated.');
    $('.modal-alert').modal('show');
    $('.modal-alert button').off('click');
    name = $('#name-tf').val();
    $('#pass-tf').val('');
    $('#pass-tfv').val('');
};

HomeAdminController.prototype.onCreateSuccess = function()
{

    // setup the alert that displays when an account is successfully created //

    $('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
    $('.modal-alert .modal-header h3').text('Success!');
    $('.modal-alert .modal-body p').html('Account has been Created.');
    $('.modal-alert').modal('show');
    $('.modal-alert button').off('click');
    $('#name-tf').val('');
    $('#dni-tf').val('');
    $('#pass-tf').val('');
    $('#pass-tfv').val('');
    this.getDoctors();

};


HomeAdminController.prototype.init = function()
{

    name = $('#name-tf').val();
    dni = $('#dni-tf').val();

    $('#account-form-btn0').html('Update');
    $('#account-form-btn0').addClass('btn-primary');
    $('#account-form-btn1').html('Create');
    $('#account-form-btn1').addClass('btn-primary');

    
    this.getDoctors();

    this.onClickSettings();

};

HomeAdminController.prototype.getDoctors = function()
{
    var getDoctors = function(callback){
        var req = new XMLHttpRequest();
        var url = '/' + 'getDoctors';
        var body = {};
        req.onreadystatechange = function () {
          if (req.readyState === 4) { //datos ya recibidos
            callback(req.responseText);
          }
        };

        req.open('GET', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(body));
    };

    getDoctors(function(response){

        //console.log(response);
        $( '.opt' ).remove();
        var json = JSON.parse(response);
        if (json.doctors.length===0){
            $('.selectpicker').attr('disabled',true);
            $('.selectpicker').append('<option class="opt">'+'Do not have doctors'+'</option>');
        }else {
            for (var i=0;i<json.doctors.length;i++){
                $('.selectpicker').attr('disabled',false);
                $('.selectpicker').append('<option class="opt" value="'+json.doctors[i].dni+'">'+json.doctors[i].name+'</option>');
            }
        }
    });

};

HomeAdminController.prototype.onClickSettings = function()
{

        $('#settings').addClass('active');
        $('#create').removeClass('active');    

        $('#account-form h1').text('Account Settings');
        $('#account-form #sub1').text('Here are the current settings for your account.');
        $('#name-tf').val(name);
        $('#dni-tf').val(dni);
        $('#dni-tf').attr('disabled', true);
        $('#radio-cg').css('visibility','hidden');
        $('#pass-tf').val('');
        $('#pass-tfv').val('');
        $('#account-form-btn0').show();
        $('#account-form-btn1').hide();
        $('#doctors-cg').hide();
        $now = $('#account-form');




};

HomeAdminController.prototype.onClickCreate = function()
{
        $('#create').addClass('active');
        $('#settings').removeClass('active');        
    // customize the account signup form //

        $('#account-form h1').text('Signup');
        $('#account-form #sub1').text('Please tell us a little about yourself');
        $('#name-tf').val('');
        $('#dni-tf').attr('disabled', false);
        $('#dni-tf').val('');
        $('#radio-cg').css('visibility','visible');
        $('#pass-tf').val('');
        $('#pass-tfv').val('');
        $('#account-form-btn0').hide();
        $('#account-form-btn1').show();
        if  ($('.radio-tf').filter(':checked').val() == 0){
            $('#doctors-cg').show();
        }else {$('#doctors-cg').hide();}
        $now = $('#account-form');
};




