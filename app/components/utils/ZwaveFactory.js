(function () {
    'use strict'
    angular.module('utils')
        .factory('ZwaveFactory',
        ['$http', '$q', 'SocketFactory', ZwaveFactory]);

    //store zwave node information
    function ZwaveFactory($http, $q, SocketFactory) {
        var svc = {}
        svc.nodes = [];
        svc.log = [];

        function getAllNodes() {
            $http.get('/api/zwave/allnodes').then(function (response) {
                svc.nodes.length = 0;
                angular.extend(svc.nodes, response.data);
            }, function (error) {
                console.error(error);
            });
        }

        //Register events with socket.io
        SocketFactory.on('notification', function (msg) {
            svc.log.push(msg);
        });
        SocketFactory.on('node ready', function (data) {
            svc.nodes.push(data);
        });
        SocketFactory.on('node changed', function (data) {
            console.log('node changed emitted: '+JSON.stringify(data));
            angular.extend(svc.nodes[data.node_id], data);
        });

        //public methods
        svc.sendCmd = function (nodeid, cmdclass, index, value) {
            var payload = {
                'nodeid': nodeid,
                'cmdclass': cmdclass,
                'index': index,
                'value': value,
                'clientId': SocketFactory.clientId
            };
            $http.post('/api/zwave/sendcmd', payload).then(function (response) {
                console.log(response.data);
            }, function (error) {
                console.log(error);
            });



        }

        //init
        getAllNodes();

        return svc;
    }
})();