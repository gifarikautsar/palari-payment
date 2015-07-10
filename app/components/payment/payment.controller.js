paymentApp.controller('paymentController', ['$scope', '$http', '$log', '$state', '$stateParams', 'dataFactory', 'Idle', function($scope, $http, $log, $state, $stateParams, dataFactory, Idle){
	$scope.state = 0;
  	$scope.productDetails = dataFactory.getObject('productDetails');
}]);
