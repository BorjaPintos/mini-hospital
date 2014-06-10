
function DateValidator(){
    'use strict';
    
    this.formFields = [$('#day-tf')];
    this.controlGroups = [$('#day-cg')];


    this.alert = $('.modal-form-errors');
    this.alert.modal({ show : false, keyboard : true, backdrop : true});
    

    
    this.showErrors = function(a){
        $('.modal-form-errors .modal-body p').text('Please correct the following problems :');
        var ul = $('.modal-form-errors .modal-body ul');
            ul.empty();
        for (var i=0; i < a.length; i++) {
            ul.append('<li>'+a[i]+'</li>');
        }
        this.alert.modal('show');
    };


    this.validateDay = function(r){

        var date = new Date(r),
            today = new Date();
        
        if (date<today) {
            return false;}
        else {return true;}
    
    };


}


DateValidator.prototype.showInvalidDate = function(){
    'use strict';
    this.showErrors(['That date is ocuped.']);
};

DateValidator.prototype.showInvalidTimetable = function(){
    'use strict';
    this.showErrors(['That hour in that day does not exist.']);
};

DateValidator.prototype.showError = function(e){
    'use strict';
    this.showErrors([e]);
};

DateValidator.prototype.validateForm = function(){
    'use strict';
    var e = [];
    for (var i=0; i < this.controlGroups.length; i++) {
        this.controlGroups[i].removeClass('error');
    }
    if (this.validateDay(this.formFields[0].val()) === false) {
        this.controlGroups[0].addClass('error'); 
        e.push('Please Enter a valid Day');
    }


    if (e.length) {this.showErrors(e);}
    return e.length === 0;
};
    
