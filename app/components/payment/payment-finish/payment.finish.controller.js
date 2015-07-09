paymentApp.controller('paymentFinishController', ['$scope','$http', '$log', '$state', 'dataFactory', function($scope, $http, $log, $state, dataFactory){
  $scope.$parent.state = 4;
  $scope.transactionDetails = dataFactory.getObject('transactionDetails');
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.arrayOfShippingDetails = dataFactory.getObject('arrayOfShippingDetails');
  $scope.serviceDetails = dataFactory.getObject('serviceDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');

  $scope.save = dataFactory.getObject('transactionDetails').saved_token_id;
  $scope.test4 = dataFactory.get('cardLastDigit');

  if ($scope.customerDetails.expressPayment) {
  	console.log('token saved');
    dataFactory.setObjectLS('bbmPayToken', {
  		selectedShippingDetails: dataFactory.get('selectedShippingDetails'),
  		customerDetails: $scope.customerDetails,
      arrayOfShippingDetails: $scope.arrayOfShippingDetails,
      paymentType: $scope.transactionDetails.payment_type,
      cardLastDigit: dataFactory.get('cardLastDigit'),
      saved_token_id: dataFactory.getObject('transactionDetails').saved_token_id
  	})
  }

}]);
