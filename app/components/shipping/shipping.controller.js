paymentApp.controller('shippingController', ['$scope', '$http', '$log', '$state', 'dataFactory', 'shippingService', function($scope, $http, $log, $state, dataFactory, shippingService){
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  
  $scope.addAddress = function(){
    dataFactory.setObject('customerDetails', $scope.customerDetails);
    console.log($scope.customerDetails); 
  }

  $scope.onSubmit = function(){
    if ($scope.customerForm.$valid){
      dataFactory.setObject('customerDetails', $scope.customerDetails);
      console.log($scope.customerDetails);
      console.log(dataFactory.getObject('customerDetails'));
      console.log(dataFactory.getObject('shippingDetails'));
      $state.transitionTo('paymentDetails', { arg: 'arg'});
    }
  }

}]);

paymentApp.controller('addAddressController', ['$scope', '$http', '$log', '$state', 'dataFactory', 'shippingService', function($scope, $http, $log, $state, dataFactory, shippingService){
  $scope.shippingDetails = {};
  $scope.provinces = {};
  $scope.cities = {};
  $scope.districts = {};

  $scope.getProvinceList = function() {
    $scope.shippingDetails.city = '';
    $scope.shippingDetails.district = '';
    shippingService.getAreaList('province', '').success(function(data){
      $scope.provinces = data;
    });
    console.log($scope.provinces);
  }

  $scope.getCityList = function() {
    $scope.shippingDetails.district = '';
    shippingService.getAreaList('city', $scope.shippingDetails.province.id).success(function(data){
      $scope.cities = data;
    });
  }

  $scope.getDistrictList = function() {
    shippingService.getAreaList('district', $scope.shippingDetails.city.id).success(function(data){
      $scope.districts = data;
    });
  }

  $scope.onSubmit = function(){
    if ($scope.shippingForm.$valid){
      dataFactory.setObject('shippingDetails', $scope.shippingDetails);
      $state.transitionTo('shippingDetails', { arg: 'arg' });
    }
  };

}]);