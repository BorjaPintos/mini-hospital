
function TimetableValidator(){
    'use strict';
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

        if (date<today){return false;}
        else {return true;}
    
    };

}

TimetableValidator.prototype.showInvalidDay = function(){
    'use strict';
    this.showErrors(['That date has already had timetable for this doctor.']);
};

TimetableValidator.prototype.showInvalidDoctor = function(){
    'use strict';
    this.showErrors(['Doctor does not exist.']);
};

TimetableValidator.prototype.validateForm = function(day){
    'use strict';
    var e = [];
    if (this.validateDay(day) === false) {
         e.push('Please Enter a valid Day');
    }


    if (e.length) {this.showErrors(e);}
    return e.length === 0;
};
