var routesApp = angular.module('routesApp', ['ui.router'])

routesApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/payment');


  // $locationProvider.html5Mode(true);

})