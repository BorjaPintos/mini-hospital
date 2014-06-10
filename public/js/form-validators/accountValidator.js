
function AccountValidator(){

// build array maps of the form inputs & control groups //
    'use strict';
    this.formFields = [$('#name-tf'), $('#dni-tf'), $('.radio-tf'), $('#pass-tf'), $('#pass-tfv')];
    this.controlGroups = [$('#name-cg'), $('#dni-cg'), $('#radio-cg'), $('#pass-cg'), $('#doctors-cg')];
    
// bind the form-error modal window to this controller to display any errors //
    
    this.alert = $('.modal-form-errors');
    this.alert.modal({ show : false, keyboard : true, backdrop : true});
    
    this.validateName = function(s)
    {
        return s.length >= 3;
    };
    
    this.validatePassword = function(s)
    {
    // if user is logged in and hasn't changed their password, return ok
        if ($('#userId').val() && s===''){
            return true;
        }else{
            return s.length >= 6;
        }
    };

    this.samePassword = function(s,v)
    {
    // if password and repeat pasword are de same
        if (v===s){
            return true;
        }else{
            return false;
        }
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

    this.validateRadios = function(r){

        
        if (r>=0 && r<=3) {return true;}
        else {return false;}
        
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

AccountValidator.prototype.showInvalidDni = function(){
    'use strict';
    this.controlGroups[1].addClass('error');
    this.showErrors(['That dni is already in use.']);
};

AccountValidator.prototype.showInvalidDoctor = function(){
    'use strict';
    this.controlGroups[4].addClass('error');
    this.showErrors(['Doctor does not exist.']);
};


AccountValidator.prototype.validateForm = function(){
    'use strict';
    var e = [];
    for (var i=0; i < this.controlGroups.length; i++) {this.controlGroups[i].removeClass('error');}
    if (this.validateName(this.formFields[0].val()) === false) {
        this.controlGroups[0].addClass('error'); 
        e.push('Please Enter Your Name');
    }
    if (this.validateDni(this.formFields[1].val()) === false) {
        this.controlGroups[1].addClass('error'); 
        e.push('Please Enter A Valid Dni');
    }
    if (this.validateRadios(this.formFields[2].filter(':checked').val()) === false) {
        this.controlGroups[1].addClass('error'); 
        e.push('One Radio has to be active');
    }
    if (this.validatePassword(this.formFields[3].val()) === false) {
        this.formFields[3].addClass('error');
        e.push('Password Should Be At Least 6 Characters');
    }
    if (this.samePassword(this.formFields[3].val(),this.formFields[4].val()) === false) {
        this.controlGroups[3].addClass('error');
        e.push('Password are diferent');
    }


    if (e.length) {this.showErrors(e);}
    return e.length === 0;
};

    
