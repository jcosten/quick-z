(function () {

    angular.module('app', [
            //Vendor
            'ngMaterial',
            'ui.router',
            //App
            'utils',
            'component.devices',
        ])
        .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
            function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

                var ctype = { 'Content-Type': 'application/json' };
                $httpProvider.defaults.headers.get = ctype;
                $httpProvider.defaults.headers.post = ctype;
                $httpProvider.defaults.headers.put = ctype;
                $httpProvider.defaults.headers.delete = ctype;

                $locationProvider.html5Mode(true); 
                
                $urlRouterProvider.otherwise(function ($injector, $location) {
                    var $state = $injector.get("$state");
                    $state.go("Devices");
                });

                $stateProvider
                    .state('Devices', {
                        url: '/devices',
                        templateUrl: '/app/components/Devices/devices.html',
                        controller: 'DevicesController as dvm'
                    })  
            }])

})();