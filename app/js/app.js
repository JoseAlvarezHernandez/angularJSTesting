var testingAngularApp = angular
    .module('testingAngularApp', []);


testingAngularApp.controller('testingAngularCtrl', function ($rootScope, $scope, $http, $timeout) {
    $scope.title = 'Testing AngularJS Application';


    $scope.apiKey = 'f8d093997d4ede6abdf4af3e884c1c0f';

    $scope.destinations = [];

    $scope.newDestination = {
        city: undefined,
        country: undefined
    };

    $scope.addDestination = function () {
        $scope.destinations.push({
            city: $scope.newDestination.city,
            country: $scope.newDestination.country
        });
    }

    $scope.removeDestination = function (index) {
        $scope.destinations.splice(index, 1);
    }

    $scope.messageWatcher = $scope.$watch('message', function () {
        if ($scope.message) {
            $timeout(function () {
                $rootScope.message = null;
            }, 3000);
        }
    });
});

testingAngularApp.filter('warmestDestinations', function () {
    return function (destinations, minimunTemp) {
        var warmDestinations = [];
        angular.forEach(destinations, function (destination) {
            if (destination.weather && destination.weather.temp && destination.weather.temp >= minimunTemp) {
                warmDestinations.push(destination);
            }
        });

        return warmDestinations;
    }
});

testingAngularApp.directive('destinationDirective', function () {
    return {
        scope: {
            destination: '=',
            apiKey: '=',
            onRemove: '&'
        },
        template: '<span>{{ destination.city }}, {{ destination.country }}</span>' +
            '<span ng-if="destination.weather" >' +
            '- {{ destination.weather.main }}, {{ destination.weather.temp }}' +
            '</span >' +
            '<button ng-click="onRemove()">Remove</button>' +
            '<button ng-click="getWeather(destination)">Update Weather</button>',
        controller: function ($http, $rootScope, $scope) {
            $scope.getWeather = function (destination) {
                $http.get('http://api.openweathermap.org/data/2.5/weather?q=' + destination.city + '&appid=' + $scope.apiKey)
                    .then(
                        function successCallback(response) {
                            if (response.data.weather) {
                                destination.weather = {};
                                destination.weather.main = response.data.weather[0].main;
                                destination.weather.temp = $scope.convertKelvinToCelsius(response.data.main.temp);
                            } else {
                                $rootScope.message = 'City not found';
                            }
                        },
                        function errorCallback(error) {
                            $rootScope.message = 'Server error';
                        }
                    );
            }

            $scope.convertKelvinToCelsius = function (temp) {
                return Math.round(temp - 273);
            }
        }
    }
})