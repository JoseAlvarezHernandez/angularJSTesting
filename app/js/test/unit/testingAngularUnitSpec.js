describe('Testig AngularJS Test Suite', function () {

    beforeEach(module('testingAngularApp'));

    describe('testing AngularJs Controller', function () {

        var scope = {}, ctrl, httpBackend, timeout, rootScope;

        beforeEach(inject(function ($controller, $rootScope, $httpBackend, $timeout) {
            rootScope = $rootScope;
            timeout = $timeout;
            httpBackend = $httpBackend;
            scope = $rootScope.$new();
            ctrl = $controller('testingAngularCtrl', { $scope: scope });
        }));

        afterEach(function () {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should initialize the title in the scope', function () {
            expect(scope.title).toBeDefined();
            expect(scope.title).toBe('Testing AngularJS Application');
        });

        it('should add 2 destinations to the destinations list', function () {
            expect(scope.destinations).toBeDefined();
            expect(scope.destinations.length).toBe(0);

            scope.newDestination = {
                city: 'London',
                country: 'England'
            };

            scope.addDestination();


            expect(scope.destinations.length).toBe(1);
            expect(scope.destinations[0].city).toBe('London');
            expect(scope.destinations[0].country).toBe('England');

            scope.newDestination = {
                city: 'Frankfurt',
                country: 'Germany'
            };

            scope.addDestination();


            expect(scope.destinations.length).toBe(2);
            expect(scope.destinations[1].city).toBe('Frankfurt');
            expect(scope.destinations[1].country).toBe('Germany');

        });

        it('Should remove a destination from the destinations list', function () {
            scope.destinations = [{
                city: 'Paris',
                country: 'France'
            }, {
                city: 'Warsaw',
                country: 'Poland'
            }];

            expect(scope.destinations.length).toBe(2);

            scope.removeDestination(0);

            expect(scope.destinations.length).toBe(1);
            expect(scope.destinations[0].city).toBe('Warsaw');
            expect(scope.destinations[0].country).toBe('Poland');

        });

        it('should remove the error message a fixed period of time', function () {
            rootScope.message = 'Error';
            expect(rootScope.message).toBe('Error');

            scope.$apply();
            timeout.flush();

            expect(rootScope.message).toBeNull();
        });

    });

    describe('Testing AngularJS Filter', function () {
        it('should return warm destinations', inject(function ($filter) {
            var warmest = $filter('warmestDestinations');

            var destinations = [
                {
                    city: 'Beijing',
                    country: 'China',
                    weather: {
                        temp: 21
                    }
                }, {
                    city: 'Moscow',
                    country: 'Rusia'
                }, {
                    city: 'Mexico city',
                    country: 'Mexico',
                    weather: {
                        temp: 12
                    }
                }, {
                    city: 'Lima',
                    country: 'Peru',
                    weather: {
                        temp: 15
                    }
                }
            ];

            expect(destinations.length).toBe(4);

            var warmDestinations = warmest(destinations, 15);

            expect(warmDestinations.length).toBe(2);
            expect(warmDestinations[0].city).toBe('Beijing');
            expect(warmDestinations[1].city).toBe('Lima');

        }));
    });

    describe('Testing AngularJS Directive', function () {

        var scope, template, httpBackend, isolateScope, rootScope;

        beforeEach(inject(function ($compile, $rootScope, $httpBackend) {
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
            rootScope = $rootScope;
            scope.destination = {
                city: 'Tokyo',
                country: 'Japan'
            };

            scope.apiKey = 'xyz';

            var element = angular.element(
                '<div destination-directive destination="destination" api-key="apiKey" on-remove="remove()"></div>'
            );

            template = $compile(element)(scope);
            scope.$digest();
            isolateScope = element.isolateScope();
        }));

        it('should update the weather for a specific destination', function () {
            scope.destinations = {
                city: 'Melbourne',
                country: 'Australia'
            };

            httpBackend
                .expectGET('http://api.openweathermap.org/data/2.5/weather?q=' + scope.destinations.city + '&appid=' + scope.apiKey)
                .respond({
                    weather: [{ main: 'Rain', detail: 'Light rain' }],
                    main: { temp: 288 }
                });

            isolateScope.getWeather(scope.destinations);
            httpBackend.flush();

            expect(scope.destinations.weather.main).toBe('Rain');
            expect(scope.destinations.weather.temp).toBe(15);
        });

        /** */
        it('should add a message if no city is found', function () {
            scope.destinations = {
                city: 'Melbourne',
                country: 'Australia'
            };

            httpBackend
                .expectGET('http://api.openweathermap.org/data/2.5/weather?q=' + scope.destinations.city + '&appid=' + scope.apiKey)
                .respond({});

            isolateScope.getWeather(scope.destinations);
            httpBackend.flush();

            expect(rootScope.message).toBe('City not found');
        });

        it('should add a message when there is a server error', function () {
            scope.destinations = {
                city: 'Melbourne',
                country: 'Australia'
            };

            httpBackend
                .expectGET('http://api.openweathermap.org/data/2.5/weather?q=' + scope.destinations.city + '&appid=' + scope.apiKey)
                .respond(500);

            isolateScope.getWeather(scope.destinations);
            httpBackend.flush();

            expect(rootScope.message).toBe('Server error');
        });
        /** */
        it('should call the parent controller remove function', function () {
            scope.removeTest = 1;
            scope.remove = function () {
                scope.removeTest++;
            };

            isolateScope.onRemove();

            expect(scope.removeTest).toBe(2);
        });

        it('should generate the correct HTML', function () {
            var templateAsHtml = template.html();

            expect(templateAsHtml).toContain('Tokyo, Japan');

            scope.destination.city = 'London';
            scope.destination.country = 'England';

            scope.$digest();
            templateAsHtml = template.html();

            expect(templateAsHtml).toContain('London, England');
        })
    });
});