paymentApp.controller('shippingController', ['$scope', '$http', '$log', '$state', 'dataService', 'shippingService', function($scope, $http, $log, $state, dataService, shippingService){
  $scope.productDetails = dataService.getProductDetails();
  $scope.shippingDetails = dataService.getShippingDetails();
  $scope.customerDetails = dataService.getCustomerDetails();
  
  $scope.addAddress = function(){
    $state.transitionTo('shippingDetails', {productDetails: $scope.productDetails});  
  }

}]);

paymentApp.controller('addAddressController', ['$scope', '$http', '$log','dataService', 'shippingService', function($scope, $http, $log, dataService, shippingService){
  $scope.shippingDetails = {
    full_name : "",
    phone_number : "",
    address : "",
    province_id : "",
    city_id : "",
    district_id: ""
  };
  $scope.provinces = {};
  $scope.cities = {};
  $scope.districts = {};

  shippingService.initAreaList();

  $scope.$watch('shippingService.getAreaList()', function(newVal) {
    $scope.provinces = newVal;
    console.log(newVal);
  });

  $scope.getProvinceList = function() {
    // $scope.shippingDetails.city_id = '';
    // $scope.shippingDetails.district_id = '';
    // shippingService.initAreaList();
    // $scope.provinces = shippingService.getAreaList();
    // $log.debug("-----" + $scope.provinces);
  };

  $scope.getCityList = function() {
    $scope.shippingDetails.district_id = '';
    $scope.cities = shippingService.getAreaList('city', $scope.shippingDetails.province_id);
  };

  $scope.getDistrictList = function() {
    $scope.shippingDetails.city_id = '';
    $scope.shippingDetails.district_id = '';
    $scope.districts = shippingService.getAreaList('district', $scope.shippingDetails.district_id);
  };

  $scope.onSubmit = function(){
    if ($scope.shippingForm.$valid){
      $scope.shippingDetails.provinceName = shippingService.getAreaName('province', $scope.shippingDetails.province_id);
      $scope.shippingDetails.cityName = shippingService.getAreaName('city', $scope.shippingDetails.city_id);
      $scope.shippingDetails.districtName = shippingService.getAreaName('district', $scope.shippingDetails.district_id);
      dataService.setShippingDetails($scope.shippingDetails);
      $state.transitionTo('shippingDetails', { arg: 'arg' });
    }
  };
}]);