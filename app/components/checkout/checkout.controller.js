paymentApp.controller('checkoutController', ['$scope', '$http', '$log', '$state', '$stateParams', '$window', 'dataFactory', function($scope, $http, $log, $state, $stateParams, $window, dataFactory){
  $scope.productDetails = {};
  $scope.productDetails.qty = 1;
  $scope.productId = $stateParams.productId;
  
  $scope.getProduct = function(){
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
      $scope.productDetails = data;
      $scope.productDetails.qty = 1;
      $log.debug($scope.productDetails);
      $log.debug("Get product details success");
      $scope.productDetails.totalAmount = $scope.productDetails.price * $scope.productDetails.qty;
    })
    .error(function(data){
      $scope.error = data.description;
      $state.transitionTo('500', { arg: 'arg'});        
    });
  };

  $scope.checkout = function(){
    dataFactory.setObject('productDetails', $scope.productDetails);
    $state.transitionTo('shippingDetails', { arg: 'arg' });  
  }

}]);
