
function HomePatientController(){

    var name,
        dni,
        that = this,
        $now, 
        start =  new Date(),
        startOrder =  new Date(),
        dv = new DateValidator();


        
// handle user logout //
    $('#btn-logout').click(function(){ that.attemptLogout(); });

// click room //
    $('#but-room').click(function(){ that.getRoom(); });


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


    //handle Order
    $('#orderDate').click(function(){
        $('#calendar2').fullCalendar( 'removeEvents'); 
        that.updateFreeDates(); 
        that.refreshScreen('#orderDate-container',that.onClickOrderDate); 
    });

    $('#btnBackOrder').click(function(){
        $('#calendar2').fullCalendar('prev');
        start = $('#calendar2').fullCalendar('getDate');
        $('#calendar2').fullCalendar( 'removeEvents');
        that.updateFreeDates();
    });

    $('#btnNextOrder').click(function(){
        $('#calendar2').fullCalendar('next');
        start = $('#calendar2').fullCalendar('getDate');
        $('#calendar2').fullCalendar( 'removeEvents');
        that.updateFreeDates();
    });

    $('#btnTodayOrder').click(function(){

        $('#calendar2').fullCalendar('today');
        start = $('#calendar2').fullCalendar('getDate');
        $('#calendar2').fullCalendar( 'removeEvents');
        that.updateFreeDates();

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
                 that.showLockedAlert(
                     'You are now logged out.<br>'+
                     'Redirecting you back to the homepage.'
                 );
            },
            error: function(jqXHR){
                console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
            }
        });
    };

    this.showLockedAlert = function(msg){
        $('.modal-alert').modal({ show : false, 
                                    keyboard : false,
                                    backdrop : 'static' });
        $('.modal-alert .modal-header h3').text('Success!');
        $('.modal-alert .modal-body p').html(msg);
        $('.modal-alert').modal('show');
        $('.modal-alert button').click(function(){
            window.location.href = '/';
        });
        setTimeout(function(){window.location.href = '/';}, 3000);
    };

    this.updateFreeDates = function(){

        var getTimeTable = function(callback){
            st=startOrder;
            var req = new XMLHttpRequest();
            var url = '/' + 'getTimeTable';
            var body = {start: st};
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
                        title: 'Free',
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
                $('#calendar2').fullCalendar( 'addEventSource', source );
            }
            
        });

    };

    this.updateEvents = function(){

        var getDates = function(callback){
            st=start;
            var req = new XMLHttpRequest();
            var url = '/' + 'getDates';
            var body = {start: st};
            req.onreadystatechange = function () {
              if (req.readyState === 4) { //datos ya recibidos
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
                        title: (json.dates[i].done==='true') ? 'Date done' : 'Date',
                        start: new Date(json.dates[i].start),
                        end: new Date(json.dates[i].end),
                        roomId : json.dates[i].roomId,
                        allDay: false,
                        done: json.dates[i].done,
                        color: (json.dates[i].done==='true') ? 'green' : 'red',
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

    //EMPIEZA AQUI
    //for view dates
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
            eventClick: function(event) {
                if (event.done!=='true'){
                    $('.modal-in-or-delete').modal({ show : false, 
                                                    keyboard : false, 
                                                    backdrop : 'static' });
                    $('.modal-in-or-delete .modal-header h3').text('Date');
                    $('.modal-in-or-delete .modal-body p').html('Do you want to go in?');
                    $('.modal-in-or-delete').modal('show');
                    $('.modal-in-or-delete #btn1').click(function(){
                        window.location.href = '/room/'+event.roomId;
                    });
                    $('.modal-in-or-delete #btn0').hide();
                    $('.modal-in-or-delete #btn2').hide();
                }
            }
        });

        


    
    //ACABA
    //for order
    $('#calendar2').fullCalendar({
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
            eventClick: function(event) {

                var date = new Date(event.start);

                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                if (month < 10) {month = '0' + month;}
                if (day < 10) {day = '0' + day;}
                var today = day + '-' + month + '-' + year;

                var hour = date.getHours();
                var minutes = date.getMinutes();
                if (hour < 10) {hour = '0' + hour;}
                if (minutes < 10) {minutes = '0' + minutes;}
                var time = hour + ':' + minutes;


                $('.modal-confirm').modal({ show : false, 
                                            keyboard : false, 
                                            backdrop : 'static' });
                $('.modal-confirm .modal-header h3').text(event.title);
                $('.modal-confirm .modal-body p').html('Do you want to order on '+ today + ' at ' + time + '?');
                $('.modal-confirm').modal('show');
                $('.modal-confirm button').off('click');
                $('.modal-confirm #btn0').click(function(){
                    if (dv.validateForm())
                    {
                        $.ajax({
                            url: '/order',
                            type: 'POST',
                            data: { 
                                    id: event.id,
                                  },
                            success: function(data){
                                    that.updateEvents();
                                     that.onOrderSuccess();
                                    that.refreshScreen('#room-container',that.onClickRooms);
                            },
                            error: function(jqXHR){
                                console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
                                if (jqXHR.responseText === 'date-taken'){
                                    dv.showInvalidDate();
                                }if (jqXHR.responseText === 'hour-no-exist'){
                                    dv.showInvalidTimetable();
                                }else {
                                    dv.showError(jqXHR.responseText);
                                }
                            }
                        });
                    }
        
                });



            }
        });


};



}

HomePatientController.prototype.refreshScreen = function(aparece, callback){

    var $portlet = $(aparece);
    $now.fadeOut(function(){
        callback();
        $portlet.fadeIn();
    });
    
};


HomePatientController.prototype.onUpdateSuccess = function(){

    $('.modal-alert').modal({ show : false, 
                                keyboard : true, 
                                backdrop : true });
    $('.modal-alert .modal-header h3').text('Success!');
    $('.modal-alert .modal-body p').html('Your account has been updated.');
    $('.modal-alert').modal('show');
    $('.modal-alert button').off('click');
    name = $('#name-tf').val();
    $('#pass-tf').val('');
    $('#pass-tfv').val('');
};


HomePatientController.prototype.onOrderSuccess = function(){

    $('.modal-alert').modal({ show : false, 
                                keyboard : false, 
                                backdrop : 'static' });
    $('.modal-alert .modal-header h3').text('Success!');
    $('.modal-alert .modal-body p').html('You have already order a date');
    $('.modal-alert').modal('show');
    $('.modal-alert button').off('click');
    $('#calendar').fullCalendar( 'removeEvents');
        
};



HomePatientController.prototype.init = function(){


    name = $('#name-tf').val();
    dni = $('#dni-tf').val();

    $('#account-form-btn0').html('Update');
    $('#account-form-btn0').addClass('btn-primary');
    $('#account-form-btn1').remove();
    $('#doctors-cg').hide();
    $('#doctors-cg').attr('disabled', true);
    this.createCalendar();
    this.updateEvents(); 
    this.onClickRooms();



    var date = new Date();

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    if (month < 10) {month = '0' + month;}
    if (day < 10) {day = '0' + day;}
    var today = year + '-' + month + '-' + day;

};

HomePatientController.prototype.onClickSettings = function(){

    $('#room-container').hide();
    $('#orderDate-container').hide();
    $('#account-form').show();

    $('#settings').addClass('active');
    $('#rooms').removeClass('active');
    $('#orderDate').removeClass('active');

    $('#account-form h1').text('Account Settings');
    $('#account-form #sub1').text('Here are the current settings for your account.');
    $('#name-tf').val(name);
    $('#dni-tf').val(dni);
    $('#dni-tf').attr('disabled', true);
    $('#radio-cg').css('visibility','hidden');
    $('#pass-tf').val('');
    $('#pass-tfv').val('');
    $('#account-form-btn0').show();

    $now=$('#account-form');


};



HomePatientController.prototype.onClickRooms = function(){

    $('#settings').removeClass('active');
    $('#orderDate').removeClass('active');
    $('#rooms').addClass('active');

    $('#room-container').show();
    $('#account-form').hide();
    $('#orderDate-container').hide();

    $now=$('#room-container');

    $('#calendar').fullCalendar('render');

};



HomePatientController.prototype.onClickOrderDate = function(){

    $('#orderDate').addClass('active');
    $('#settings').removeClass('active');
    $('#rooms').removeClass('active');

    $('#room-container').hide();
    $('#account-form').hide();
    $('#orderDate-container').show();

    $now=$('#orderDate-container');

    $('#calendar2').fullCalendar('render');

    

};
