paymentApp.controller('shippingController', ['$scope', '$http', '$log', '$state', 'dataFactory', 'shippingService', function($scope, $http, $log, $state, dataFactory, shippingService){
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.shippingPackage = "0";
  
  $scope.addAddress = function(){
    dataFactory.setObject('customerDetails', $scope.customerDetails);
    console.log($scope.customerDetails); 
  }

  $scope.getFare = function() {
    if ($scope.shippingDetails){
      $http.post(
        //url
        phinisiEndpoint + '/package/fare',
        //data
        {
          "product_id": $scope.productDetails.id,
          "destination_district_id": $scope.shippingDetails.district.id,
          "quantity": $scope.productDetails.qty
        },
        //config
        {
          headers :{ 'Content-Type': 'application/json','Accept': 'application/json'}
        }
      )
      .success(function(data){
        console.log(data);
        $scope.shippingDetails.shippingCost = data.expedition[0].expedition_service;
        console.log($scope.shippingDetails.shippingCost);
      })
      .error(function(data){
        $scope.error = data.description;
        $state.transitionTo('500', { arg: 'arg'});        
      })
    }
  }

  $scope.onSubmit = function(){
    if ($scope.customerForm.$valid){
      if ($scope.productDetails.need_address && ($scope.shippingDetails == null)){
       $scope.errorMessageShipping = "Please set your shipping address and shipping method before proceeding to the next step.";
      } 
      else {
        $scope.shippingDetails.shippingCost = $scope.shippingDetails.shippingCost[$scope.shippingPackage].service_fare;
        dataFactory.setObject('customerDetails', $scope.customerDetails);
        dataFactory.setObject('shippingDetails', $scope.shippingDetails);
        console.log($scope.customerDetails);
        console.log(dataFactory.getObject('customerDetails'));
        console.log(dataFactory.getObject('shippingDetails'));
        $state.transitionTo('paymentDetails', { arg: 'arg'});
      }
    }
    else {
      $scope.errorMessage = "Invalid form. Please correct your information details below before proceeding to the next step.";
    }
  }

}]);

paymentApp.controller('addAddressController', ['$scope', '$http', '$log', '$state', 'dataFactory', 'shippingService', function($scope, $http, $log, $state, dataFactory, shippingService){
  $scope.shippingDetails = {};
  $scope.provinces = {};
  $scope.cities = {};
  $scope.districts = {};

  $scope.$watch('shippingService.getAreaList()', function(newVal) {
    $scope.provinces = newVal;
    console.log(newVal);
  });

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