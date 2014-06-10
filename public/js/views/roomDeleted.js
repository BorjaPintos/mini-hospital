
$(window).load(function(){
    'use strict';

    if ($('#res').val() === 'Ok'){
        $('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
        $('.modal-alert .modal-header h3').text('Success!');
        $('.modal-alert .modal-body p').html('Room has been deleted, redirected to homePage');
        $('.modal-alert').modal('show');
        $('.modal-alert button').click(function(){window.location.href = '/home';});
        setTimeout(function(){window.location.href = '/home';}, 3000);
    }
    else if ($('#res').val() === 'People-still'){
        $('.modal-form-errors').modal({ show : false, keyboard : false, backdrop : true });
        $('.modal-form-errors .modal-header h3').text('Error!');
        $('.modal-form-errors .modal-body p').text('There are still people in the room, try again');
        $('.modal-form-errors').modal('show');
        $('.modal-form-errors button').html('Come Back Home');
        $('.modal-form-errors button').click(function(){window.location.href = '/home';});
        //setTimeout(function(){window.location.href = '/home';}, 3000);
    }else if ($('#res').val() === 'Date-does-not-start'){
        $('.modal-form-errors').modal({ show : false, keyboard : false, backdrop : true });
        $('.modal-form-errors .modal-header h3').text('Error!');
        $('.modal-form-errors .modal-body p').text('The date does not start, you can not done it');
        $('.modal-form-errors').modal('show');
        $('.modal-form-errors button').html('Come Back Home');
        $('.modal-form-errors button').click(function(){window.location.href = '/home';});
        //setTimeout(function(){window.location.href = '/home';}, 3000);
    }
});
