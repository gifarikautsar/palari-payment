paymentApp.controller('checkoutController', ['$scope', '$http', '$log', '$state', '$stateParams', '$window', 'dataFactory', function($scope, $http, $log, $state, $stateParams, $window, dataFactory){
  $scope.$parent.state = 1;
  $scope.productDetails = {};
  $scope.productDetails.qty = 1;
  $scope.productId = $stateParams.productId;
  
  $scope.getProduct = function(){
    $window.sessionStorage.clear();
    $window.localStorage.clear();
    $http.get(
      //url
      phinisiEndpoint + '/customer/product/' + $scope.productId,
      //config
      {
        headers :{ 'Content-Type': 'application/json','Accept': 'application/json'} ,       
      }
    )
    .success(function(data){
      if (data.merchant_id){
        $scope.productDetails = data;
        $log.debug($scope.productDetails);
        $scope.$parent.productDetails = $scope.productDetails;
      }
      else {
        $state.transitionTo('404', { arg: 'arg'})
      }
    })
    .error(function(data){
      $state.transitionTo('500', { arg: 'arg'});        
    });
  };

  $scope.$watch("productDetails.qty", function(){
    $scope.productDetails.totalAmount = $scope.productDetails.price * $scope.productDetails.qty;
  })

  $scope.checkout = function(){
    var token = dataFactory.getObjectLS('bbmPayToken');
    if (token){
      console.log(token);
      dataFactory.setObject('customerDetails', token.customerDetails);
      dataFactory.setObject('selectedShippingDetails', token.selectedShippingDetails);
      dataFactory.setObject('arrayOfShippingDetails', token.arrayOfShippingDetails);
    }
    else {
      console.log('empty');
    }
    dataFactory.setObject('productDetails', $scope.productDetails);
    $state.transitionTo('payment.shippingDetails', { arg: 'arg' });  
  }

}]);
