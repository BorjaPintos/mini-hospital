
$(document).ready(function(){
    'use strict';
    var lv = new LoginValidator();
    var lc = new LoginController();

// main login form //

    $('#login-form').ajaxForm({
        beforeSubmit : function(formData, jqForm, options){
            if (lv.validateForm() === false){
                return false;
            } else{
            // append 'remember-me' option to formData to write local cookie //
                formData.push({name:'remember-me', 
                            value:$('input:checkbox:checked').length === 1});
                return true;
            }
        },
        success    : function(responseText, status, xhr, $form){
            if (status === 'success') {window.location.href = '/home';}
        },
        error : function(e){
            lv.showInvalidLogin('Login Failure, Please check your dni and/or password');
        }
    }); 
    $('#dni-tf').focus();
    
});
