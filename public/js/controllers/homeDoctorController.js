
function HomeDoctorController()
{

    var name,
        dni,
        idPublic,
        $now,
        that = this,
        start =  new Date();



        
// handle user logout //
    $('#btn-logout').click(function(){ that.attemptLogout(); });

// click room //
    $('#but-room').click(function(){ that.getRoom(); });
    
    
//handle meeting
   $('#meetingRoom').click(function(){
        that.getMeetingId();
        that.refreshScreen('#meeting-container',that.onClickMeeting); 
    });


//handle account settings
    $('#account-settins').click(function(){
        that.refreshScreen('#account-form',that.onClickSettings); 
    });


//handle rooms
    $('#view-rooms').click(function(){
        $('#calendar').fullCalendar( 'removeEvents');
        that.updateEvents();
        that.refreshScreen('#room-container',that.onClickRooms);
    });
            
    $('#btnBack').click(function(){
        $('#calendar').fullCalendar('prev');
        start = $('#calendar').fullCalendar('getDate');
        $('#calendar').fullCalendar( 'removeEvents');
        that.updateEvents();
    });

    $('#btnNext').click(function(){
        $('#calendar').fullCalendar('next');
        start = $('#calendar').fullCalendar('getDate');
        $('#calendar').fullCalendar( 'removeEvents');
        that.updateEvents();
    });

    $('#btnToday').click(function(){

        $('#calendar').fullCalendar('today');
        start = $('#calendar').fullCalendar('getDate');
        $('#calendar').fullCalendar( 'removeEvents');
        that.updateEvents();

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

    this.updateEvents = function(){

        var getDates = function(callback){
            st=start;
            var req = new XMLHttpRequest();
            var url = '/' + 'getDates';
            var body = {start: st};
            req.onreadystatechange = function () {
              if (req.readyState === 4) { //dates already received
                callback(req.responseText);
              }
            };

            req.open('POST', url, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(body));
        };

        getDates(function(response){
            var json = JSON.parse(response);

            var events = [];
            if (json.dates.length!==0){
                for (var i=0;i<json.dates.length;i++){

                    event = {
                        title: (json.dates[i].done==='true') ? 'Work Done' : (json.dates[i].busy==='true') ?'Work' : 'Free' ,
                        start: new Date(json.dates[i].start),
                        end: new Date(json.dates[i].end),
                        roomId : json.dates[i].roomId,
                        allDay: false,
                        color: (json.dates[i].done==='true') ? 'green' : (json.dates[i].busy==='true') ?'red' : 'white' ,
                        done: json.dates[i].done,
                        busy: json.dates[i].busy,
                        patient: json.dates[i].patient,
                        textColor: 'black',
                    };
                    events.push(event);

                }        
                var source = {events : events};
                $('#calendar').fullCalendar( 'addEventSource', source );
            }
            
        });
    };
    
    this.getMeetingId = function(){

        var getMeeting = function(callback){
            var req = new XMLHttpRequest();
            var url = '/' + 'getMeetingId';
            var body = {};
            req.onreadystatechange = function () {
              if (req.readyState === 4) { //dates already received
                callback(req.responseText);
              }
            };

            req.open('POST', url, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(body));
        };

        getMeeting(function(response){
            console.log(response);
            $('#meeting-btn').click(function(){window.location.href = '/meeting/'+response}   );
        });
    };

}

HomeDoctorController.prototype.refreshScreen = function(aparece, callback)
{
    var $portlet =$(aparece);
    $now.fadeOut(function(){
        callback();
        $portlet.fadeIn();
    });
    
};


HomeDoctorController.prototype.onUpdateSuccess = function()
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


HomeDoctorController.prototype.init = function()
{

    name = $('#name-tf').val();
    dni = $('#dni-tf').val();

    $('#account-form-btn0').html('Update');
    $('#account-form-btn0').addClass('btn-primary');
    $('#account-form-btn1').hide();
    $('#doctors-cg').hide();
    $('#meeting-btn').html('Join Meeting');
    $('#meeting-btn').addClass('btn-primary');
    this.createCalendar();
    this.updateEvents();
    this.onClickRooms();
    

};

HomeDoctorController.prototype.onClickSettings = function()
{

    $('#room-container').hide();
    $('#meeting-container').hide();
    $('#account-form').show();

    $('#settings').addClass('active');
    $('#rooms').removeClass('active');
    $('#meeting').removeClass('active');

    $('#account-form h1').text('Account Settings');
    $('#account-form #sub1').text('Here are the current settings for your account.');
    $('#name-tf').val(name);
    $('#dni-tf').val(dni);
    $('#dni-tf').attr('disabled', true);
    $('#radio-cg').css('visibility','hidden');
    $('#pass-tf').val('');
    $('#pass-tfv').val('');
    $('#account-form-btn0').show();
    $now = $('#account-form');


};

HomeDoctorController.prototype.onClickMeeting = function()
{

    $('#room-container').hide();
    $('#account-form').hide();
    $('#meeting-container').show();
    
    $('#settings').removeClass('active');
    $('#rooms').removeClass('active');
    $('#meeting').addClass('active');

    $('#meeting-btn').show();
    $now = $('#meeting-container');


};


HomeDoctorController.prototype.patientInfo = function(patientDni){



    var getInfo = function(pdni, callback){
        var req = new XMLHttpRequest();
        var url = '/' + 'getPatientInfo';
        var body = {dni: patientDni};
        req.onreadystatechange = function () {
          if (req.readyState === 4) { //datos ya recibidos
            callback(req.responseText);
          }
        };

        req.open('POST', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(body));
    };

    getInfo(patientDni, function(response){
        var json = JSON.parse(response);

        if (json.patient.length===1){

            $('.modal-info').modal({ show : false, keyboard : false, backdrop : 'static' });
            $('.modal-info .modal-header h3').text('Patient Info');
            $('.modal-info .modal-body #name-patient').html(json.patient[0].name);
            $('.modal-info .modal-body #dni-patient').html(json.patient[0].dni);
            $('.modal-info').modal('show');
            $('.modal-alert button').off('click');

        }
        
    });


        

        

};

HomeDoctorController.prototype.createCalendar = function(){

    //EMPIEZA AQUI

        var that=this;

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
            defaultView: 'agendaWeek',
            events: [],
            eventClick: function(event) {
                if (event.done!=='true' && event.busy==='true'){
                    $('.modal-in-or-delete').modal({ show : false, keyboard : false, backdrop : 'static' });
                    $('.modal-in-or-delete .modal-header h3').text(event.title);
                    $('.modal-in-or-delete .modal-body p').html('What do you want?');
                    $('.modal-in-or-delete').modal('show');
                    $('.modal-in-or-delete #btn2').click(function(){that.patientInfo(event.patient);});
                    $('.modal-in-or-delete #btn1').click(function(){window.location.href = '/room/'+event.roomId;});
                    $('.modal-in-or-delete #btn0').click(function(){window.location.href = '/deleteRoom/'+event.roomId;});

                }
            }
        });

        

    //ACABA


};



HomeDoctorController.prototype.onClickRooms = function()
{


    $('#settings').removeClass('active');
    $('#rooms').addClass('active');
    $('#meeting').removeClass('active');
    $('#room-container').show();
    $('#account-form').hide();
    $('#meeting-container').hide();
    $now = $('#room-container');
    $('#calendar').fullCalendar('render');

};
