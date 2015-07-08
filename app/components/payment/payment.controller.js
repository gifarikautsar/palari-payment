paymentApp.config(['KeepaliveProvider', 'IdleProvider', function(KeepaliveProvider, IdleProvider){
	IdleProvider.idle(50 * 60);
	IdleProvider.timeout(1);
	KeepaliveProvider.interval(1);
}]);

paymentApp.run(['$rootScope', 'Idle', '$state', function($rootScope, Idle, $state) {
  	Idle.watch();
	$rootScope.$on('IdleTimeout', function() {
	 	$state.transitionTo('timeout', {arg: 'arg'})   
	 });
}]);

paymentApp.controller('paymentController', ['$scope', '$http', '$log', '$state', '$stateParams', 'dataFactory', 'Idle', function($scope, $http, $log, $state, $stateParams, dataFactory, Idle){
	$scope.state = 0;
  	$scope.productDetails = dataFactory.getObject('productDetails');
}]);
