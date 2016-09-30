(function () {
    'use strict'
    angular.module('component.devices', []).controller('DevicesController', ['ZwaveFactory', HomeController]);

    function HomeController(ZwaveFactory) {
        var vm = this;

        vm.nodes = ZwaveFactory.nodes;

        vm.sendCmd = function (nodeid, cmdclass,index, value) {
            ZwaveFactory.sendCmd(nodeid, cmdclass,index, value);
        }
    }
})();