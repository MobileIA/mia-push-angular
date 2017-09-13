(function() {
    'use strict';

    angular
        .module('mobileiaPush', ['mobileiaAuthentication'])
        .factory('mobileiaPush', mobileiaPush);

    mobileiaPush.$inject = ['mobileiaAuth', '$rootScope'];

    function mobileiaPush(mobileiaAuth, $rootScope) {
        var socket = null;
        var isConnected = false;
        var baseUrl = 'http://push.mobileia.com:8080/';
        
        var service = {
            init: init,
            on: on,
            emit: emit,
            reconnect: reconnect
        };
        
        return service;
        
        function init(){
            // Verificamos si ya se inicio un socket
            if(isConnected){
                console.log("Ya existe un socket abierto");
                return false;
            }
            // Iniciamos socket
            socket = io.connect(baseUrl, {
                query: 'appId=' + mobileiaAuth.getAppId() + '&accessToken=' + mobileiaAuth.getAccessToken(),
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax : 5000,
                reconnectionAttempts: 99999,
                timeout : 5000,
                'connect timeout': 5000
            });
            // Seteamos variable que se inicio socket
            isConnected = true;
        };
        
        function on(event, callback){
            socket.on(event, function(msg){
                $rootScope.$apply(function(){
                    callback(msg);
                });
            });
        };
        
        function emit(event, message, callback){
            socket.emit('miapush_event', {event: event, message: message}, function(msg){
                $rootScope.$apply(function(){
                    callback(msg);
                });
            });
        };
        /**
         * Funcion que se encarga de conectar nuevamente el socket
         */
        function reconnect(){
            if (socket.socket.connected === false && socket.socket.connecting === false) {
                // use a connect() or reconnect() here if you want
                socket.socket.connect();
           }
        };
    }
})();