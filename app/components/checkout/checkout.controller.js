paymentApp.controller('checkoutController', ['$scope', '$http', '$log', '$state', 'dataService', function($scope, $http, $log, $state, dataService){
  $scope.productDetails = {};
  $scope.productDetails.quantity = 1;
  
  $scope.getProduct = function(){
    $http.get(
      //url
      phinisiEndpoint + '/customer/product/c3e5d255-dbaf-42a9-b938-2de5156037f7',
      //config
      {
        headers :{ 'Content-Type': 'application/json','Accept': 'application/json'} ,       
      }
    )
    .success(function(data){
      $scope.productDetails = data;
      $scope.productDetails.quantity = 1;
      $log.debug($scope.productDetails);
      $log.debug("Get product details success");
      $scope.productDetails.totalAmount = $scope.productDetails.price * $scope.productDetails.quantity;
    })
    .error(function(data){
      $scope.error = data.description;        
    });
  };

  $scope.checkout = function(){
    dataService.setProductDetails($scope.productDetails);
    $state.transitionTo('shippingDetails', { arg: 'arg' });  
  }

}]);
