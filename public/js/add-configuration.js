'use strict';

$('#addConfiguration').click(function () {
    $.ajax({
        method: 'POST',
        url: window.location.pathname,
        data: {
            collectorUrl: $('#collectorUrl').val(),
            trackingCode: $('#trackingCode').val()
        }
    }).done(function (msg) {
        window.location.reload();
    });
});

$("#removeConfiguration button").click(function () {
    var gameTitle = $(this).val();
    var configurationId = gameTitle.substring(gameTitle.length - 1);
    $.ajax({
        method: 'DELETE',
        url: window.location.pathname,
        data: {
            configurationId: configurationId
        }
    }).done(function (msg) {
        window.location.reload();
    });
});