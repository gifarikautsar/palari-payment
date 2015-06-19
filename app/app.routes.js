var routesApp = angular.module('routesApp', ['ui.router'])

routesApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/404');

  // $locationProvider.html5Mode(true);

})