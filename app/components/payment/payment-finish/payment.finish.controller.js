paymentApp.controller('paymentFinishController', ['$scope','$http', '$log', '$state', 'dataFactory', function($scope, $http, $log, $state, dataFactory){
  $scope.$parent.state = 4;
  $scope.transactionDetails = dataFactory.getObject('transactionDetails');
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');

  if ($scope.customerDetails.expressPayment) {
  	console.log('token saved');
  	dataFactory.setObjectLS('bbmPayToken', {
  		shippingDetails: $scope.shippingDetails,
  		customerDetails: $scope.customerDetails
  	})
  }

}]);
