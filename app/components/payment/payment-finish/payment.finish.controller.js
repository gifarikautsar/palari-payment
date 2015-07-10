paymentApp.controller('paymentFinishController', ['$scope','$http', '$log', '$state', 'dataFactory', '$crypto', function($scope, $http, $log, $state, dataFactory, $crypto){
  $scope.$parent.state = 4;
  $scope.transactionDetails = dataFactory.getObject('transactionDetails');
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.arrayOfShippingDetails = dataFactory.getObject('arrayOfShippingDetails');
  $scope.serviceDetails = dataFactory.getObject('serviceDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');

  $scope.bbmToken = {
    selectedShippingDetails: dataFactory.get('selectedShippingDetails'),
    customerDetails: $scope.customerDetails,
    arrayOfShippingDetails: $scope.arrayOfShippingDetails,
    paymentType: $scope.transactionDetails.payment_type,
    cardLastDigit: dataFactory.get('cardLastDigit'),
    saved_token_id: dataFactory.get('saved_token_id')
  };

  $scope.encrypted = $crypto.encrypt(JSON.stringify($scope.bbmToken));

  if ($scope.customerDetails.expressPayment) {
  	console.log('token saved');
    dataFactory.setObjectLS('bbmPayToken', $scope.encrypted);
  }

}]);
