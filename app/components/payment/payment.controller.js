paymentApp.controller('paymentController', ['$scope', '$http', '$log', '$state', '$stateParams', 'dataFactory', function($scope, $http, $log, $state, $stateParams, dataFactory){
	$scope.state = 0;
  	$scope.productDetails = dataFactory.getObject('productDetails');

}]);
