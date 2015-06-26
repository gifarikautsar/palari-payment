paymentApp.controller('checkoutController', ['$scope', '$http', '$log', '$state', '$stateParams', '$window', 'dataFactory', function($scope, $http, $log, $state, $stateParams, $window, dataFactory){
  $scope.$parent.state = 1;
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
      if (data.merchant_id){
        $scope.productDetails = data;
        $scope.productDetails.qty = 1;
        $log.debug($scope.productDetails);
        $log.debug("Get product details success");
        $scope.productDetails.totalAmount = $scope.productDetails.price * $scope.productDetails.qty;  
        $scope.$parent.productDetails = $scope.productDetails;
      }
      else {
        $state.transitionTo('404', { arg: 'arg'})
      }
    })
    .error(function(data){
      $scope.error = data.description;
      $state.transitionTo('500', { arg: 'arg'});        
    });
  };

  $scope.$watch("productDetails.qty", function(){
    $scope.productDetails.totalAmount = $scope.productDetails.price * $scope.productDetails.qty;
  })

  $scope.checkout = function(){
    dataFactory.setObject('productDetails', $scope.productDetails);
    $state.transitionTo('payment.shippingDetails', { arg: 'arg' });  
  }

}]);
