paymentApp.controller('paymentFinishController', ['$scope','$http', '$log', '$state', 'dataFactory', function($scope, $http, $log, $state, dataFactory){
  $scope.$parent.state = 4;
  $scope.transactionDetails = dataFactory.getObject('transactionDetails');
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.arrayOfShippingDetails = dataFactory.getObject('arrayOfShippingDetails');
  $scope.serviceDetails = dataFactory.getObject('serviceDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');

  if ($scope.customerDetails.expressPayment) {
  	console.log('token saved');
  	dataFactory.setObjectLS('bbmPayToken', {
  		selectedShippingDetails: dataFactory.get('selectedShippingDetails'),
  		customerDetails: $scope.customerDetails,
      arrayOfShippingDetails: $scope.arrayOfShippingDetails
  	})
  }

}]);
