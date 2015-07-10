var paymentApp = angular.module("paymentApp", [
	'ngAnimate', 
	'angularPayments', 
	'routesApp', 
	'servicesApp', 
	'filterApp', 
	'formApp', 
	'dropdownApp', 
	'ngMaterial', 
	'ngIdle', 
	'mdo-angular-cryptography'
]).config(['$cryptoProvider', function($cryptoProvider){
   	$cryptoProvider.setCryptographyKey('VeritransBBMPay');
}]);