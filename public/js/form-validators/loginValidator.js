
function LoginValidator(){
    'use strict';
// bind a simple alert window to this controller to display any errors //
    this.formFields = [$('#dni-tf'), $('.radio-tf')];
    this.controlGroups = [$('#dni-cg'), $('#radio-cg')];
    
// bind the form-error modal window to this controller to display any errors //
    
    this.alert = $('.modal-form-errors');
    this.alert.modal({ show : false, keyboard : true, backdrop : true});


    this.validateRadios = function(r){
        if (r>=0 && r<=3) {return true;}
        else {return false;}
        
    };

    this.validateDni = function(e)
    {
        var numero,
              letr,
            letra,
            expresionRegularDni;
         
        expresionRegularDni = /^\d{8}[a-zA-Z]$/;
        if(expresionRegularDni.test (e) === true){
            numero = e.substr(0,e.length-1);
            letr = e.substr(e.length-1,1);
            numero = numero % 23;
            letra='TRWAGMYFPDXBNJZSQVHLCKET';
            letra=letra.substring(numero,numero+1);
            if (letra!==letr) {
               return false;
            }else{
               return true;
            }
          }else{
             return false;
             }
    };
    
    this.showErrors = function(a)
    {
        $('.modal-form-errors .modal-body p').text('Please correct the following problems :');
        var ul = $('.modal-form-errors .modal-body ul');
            ul.empty();
        for (var i=0; i < a.length; i++) {ul.append('<li>'+a[i]+'</li>');}
        this.alert.modal('show');
    };


}

LoginValidator.prototype.showInvalidLogin = function (e){
    'use strict';
    this.showErrors([e]);
}

LoginValidator.prototype.validateForm = function()
{
    'use strict';
    var e = [];
    for (var i=0; i < this.controlGroups.length; i++) {this.controlGroups[i].removeClass('error');}
    

    if (this.validateDni(this.formFields[0].val()) === false) {
        this.controlGroups[0].addClass('error'); 
        e.push('Please Enter A Valid Dni. The letter have to be uppercase');
    }
    if (this.validateRadios(this.formFields[1].filter(':checked').val()) === false) {
        this.controlGroups[1].addClass('error'); 
        e.push('One Radio has to be active');
    }



    if (e.length) {this.showErrors(e);}
    return e.length === 0;
    
    
};
