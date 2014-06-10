
function HomePlannerController()
{

    var name,
        dni,
        $now,
        start =  new Date(),
        that = this,
        tv = new TimetableValidator();


        
// handle user logout //
    $('#btn-logout').click(function(){ that.attemptLogout(); });


//handle account settings
    $('#account-settins').click(function(){ that.refreshScreen('#account-form',that.onClickSettings); });
            
    $('#addTimeTable').click(function(){$('#calendar').fullCalendar( 'removeEvents'); that.updateTimetable(); that.refreshScreen('#timetable-container',that.onClickTimetables); });

    $('.selectpicker').change(function(){
        $('#calendar').fullCalendar( 'removeEvents');
        that.refreshScreen('#timetable-container', that.updateTimetable);
    });

    $('#timetable-form-btn0').click(function(){
        //if (tv.validateForm())
        //{
            $.ajax({
                url: '/newTimetable',
                type: 'POST',
                data: { 
                    doctorDni     : '44846758R',
                    day         : '2014-05-01'
                      },
                success: function(data){
                     that.onCreateSuccess();
                },
                error: function(jqXHR){
                    console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
                    if (jqXHR.responseText === 'Timetable-exist'){
                        tv.showInvalidDay();
                    }if (jqXHR.responseText === 'Doctor-no-exist'){
                        tv.showInvalidDoctor();
                    }
                }
            });
        //}
        
    });

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
        $('.modal-alert button').click(function(){window.location.href = '/';});
        setTimeout(function(){window.location.href = '/';}, 3000);
    };

    $('#btnBack').click(function(){
        $('#calendar').fullCalendar('prev');
        start = $('#calendar').fullCalendar('getDate');
        $('#calendar').fullCalendar( 'removeEvents');
        that.updateTimetable();
    });

    $('#btnNext').click(function(){
        $('#calendar').fullCalendar('next');
        start = $('#calendar').fullCalendar('getDate');
        $('#calendar').fullCalendar( 'removeEvents');
        that.updateTimetable();
    });

    $('#btnToday').click(function(){

        $('#calendar').fullCalendar('today');
        start = $('#calendar').fullCalendar('getDate');
        $('#calendar').fullCalendar( 'removeEvents');
        that.updateTimetable();

    });

    this.updateTimetable = function(){

        var getTimeTable = function(callback){
            st=start;
            dni=$('.selectpicker').val();
            var req = new XMLHttpRequest();
            var url = '/' + 'getTimeTable';
            var body = {start: st, doctorDni:dni};
            req.onreadystatechange = function () {
              if (req.readyState === 4) { //datos ya recibidos
                callback(req.responseText);
              }
            };

            req.open('POST', url, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(body));
        };

        getTimeTable(function(response){
            var json = JSON.parse(response);

            var events = [];
            if (json.timetables.length!==0){
                for (var i=0;i<json.timetables.length;i++){
                    event = {
                        title: 'Work',
                        start: new Date(json.timetables[i].start),
                        end: new Date(json.timetables[i].end),
                        allDay: false,
                        color: 'green',
                        id: json.timetables[i]._id,
                        textColor: 'black',
                    };
                    events.push(event);

                }        
                var source = {events : events};
                $('#calendar').fullCalendar( 'addEventSource', source );
            }
            
        });

    };

    this.createCalendar = function(){

        $('#calendar').fullCalendar({
            editable: false,
            firstHour: 8,
            firstDay: 1,
            minTime: 8,
            maxTime: 14,
            allDaySlot: false,
            columnFormat: {
                week: 'ddd dd', // Mon 9/7
            },
            timeFormat: 'H:mm',
            axisFormat: 'H:mm',
            header: {
                right: 'month,agendaWeek,agendaDay'
            },
            defaultView: 'month',
            events: [],
            dayClick: function(date) {

                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                if (month < 10) {month = '0' + month;}
                if (day < 10) {day = '0' + day;}
                var today = day + '-' + month + '-' + year;

                $('.modal-confirm').modal({ show : false, keyboard : false, backdrop : 'static' });
                $('.modal-confirm .modal-header h3').text(event.title);
                $('.modal-confirm .modal-body p').html('Do you want to create timetable on '+ today + "?");
                $('.modal-confirm').modal('show');
                $('.modal-confirm button').off('click');
                $('.modal-confirm #btn0').click(function(){
                    
                    if (tv.validateForm(date))
                    {
                        $.ajax({
                            url: '/newTimetable',
                            type: 'POST',
                            data: { 
                                    doctorDni: $('.selectpicker').val(),
                                    day: date
                                  },
                            success: function(data){
                                    $('#calendar').fullCalendar( 'removeEvents');
                                    
                                     that.onCreateSuccess();
                                    that.refreshScreen('#timetable-container',that.updateTimetable);
                            },
                            error: function(jqXHR){
                                console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
                                if (jqXHR.responseText === 'Timetable-exist'){
                                    tv.showInvalidDay();
                                }if (jqXHR.responseText === 'Doctor-no-exist'){
                                    tv.showInvalidDoctor();
                                }
                            }
                        });
                    }
        
                });



            }
        });

        var today = new Date();
        var day = today.getDate() +1;
        var month = today.getMonth();
        var year = today.getFullYear();
        
        $('#calendar').fullCalendar( 'gotoDate', year , month,  day  );




    };

    this.onCreateSuccess = function(){

    // setup the alert that displays when an timetable is successfully created //
        $('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
        $('.modal-alert .modal-header h3').text('Success!');
        $('.modal-alert .modal-body p').html('Timetable has been Created.');
        $('.modal-alert').modal('show');
        $('.modal-alert button').off('click');

    };




}



HomePlannerController.prototype.refreshScreen = function(aparece, callback){
    var $portlet = $(aparece);
    $now.fadeOut(function(){
        callback();
        $portlet.fadeIn();
    });
};


HomePlannerController.prototype.onClickSettings = function(){

    $('#settings').addClass('active');
    $('#TimeTable').removeClass('active');
    $('#account-form h1').text('Account Settings');
    $('#account-form #sub1').text('Here are the current settings for your account.');
    $('#name-tf').val(name);
    $('#dni-tf').val(dni);
    $('#dni-tf').attr('disabled', true);
    $('#radio-cg').css('visibility','hidden');
    $('#pass-tf').val('');
    $('#pass-tfv').val('');
    $('#account-form-btn0').show();
    $('#timetable-container').hide();
    $now = $('#account-form');
        

};

HomePlannerController.prototype.onUpdateSuccess = function()
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

HomePlannerController.prototype.init = function()
{
    
    name = $('#name-tf').val();
    dni = $('#dni-tf').val();

    $('#account-form-btn0').html('Update');
    $('#account-form-btn0').addClass('btn-primary');
    $('#timetable-form-btn0.btn').html('Add');
    $('#timetable-form-btn0.btn').addClass('btn-primary');
    $('#account-form-btn1').hide();
    $('#timetable-container').hide();
    $('#doctors-cg').hide();
    $('#doctors-cg').attr('disabled', true);

    this.createCalendar();
    this.getDoctors();
    this.onClickSettings();


};

HomePlannerController.prototype.onClickTimetables = function()
{

    $('#TimeTable').addClass('active');
    $('#settings').removeClass('active');
    $('#account-form').hide();
    $('#timetable-container').show();
    $now=$('#timetable-container');
    $('#calendar').fullCalendar('render');

};

HomePlannerController.prototype.getDoctors = function()
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
        if (json.doctors.length==0){
            $('.selectpicker').append('<option class="opt"'+'Do not have doctors'+'</option>');
        }for (var i=0;i<json.doctors.length;i++){
            //console.log(json.doctors[i].name);
            $('.selectpicker').append('<option class="opt" value="'+json.doctors[i].dni+'">'+json.doctors[i].name+'</option>');
        }
    });

};

