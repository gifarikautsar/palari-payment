var routesApp = angular.module('routesApp', ['ui.router'])

routesApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider

    .state('home', {
    	url: '/',
    	templateUrl: 'app/components/home/home.html'
    })

  $locationProvider.html5Mode(true);

})