
$(document).ready(function(){
    'use strict';
    var hc = new HomeAdminController();
    var av = new AccountValidator();

        $('#account-form').ajaxForm({
            beforeSubmit : function(formData, jqForm, options){
                if (av.validateForm() === false){
                    return false;
                } else{
                // push the disabled dni and database field onto the form data array //
                    formData.push({name:'dni', 
                                value:$('#dni-tf').val()});
                    return true;
                }
            },
            success    : function(responseText, status, xhr, $form){
                if (status === 'success') {hc.onUpdateSuccess();}
            },
            error : function(e){
                if (e.responseText === 'dni-taken'){
                    av.showInvalidDni();
                }
            }
        });
        $('#dni-tf').focus();



    hc.init();

});
