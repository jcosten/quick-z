(function () {
    'use strict'
    angular.module('utils', [])
        .factory('SocketFactory',
        ['$rootScope', SocketFactory]);

    //Super Simpler angular factory for socket.io

    function SocketFactory($rootScope) {
        var svc = {};
        var socket = window.io.connect();
        socket.on('client connected', function (id) {
            svc.clientId = id;
        })
        svc.on = function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        }
        svc.emit = function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
        return svc;
    }
})();