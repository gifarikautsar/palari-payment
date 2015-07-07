paymentApp.controller('shippingController', ['$scope', '$http', '$log', '$state', 'dataFactory', 'shippingService', '$location', '$anchorScroll', function($scope, $http, $log, $state, dataFactory, shippingService, $location, $anchorScroll){
  $scope.$parent.state = 2;
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.arrayOfShippingDetails = dataFactory.getObject('arrayOfShippingDetails') || [];
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.selectedShippingDetails = dataFactory.getObject('selectedShippingDetails');
  $scope.serviceDetails = {};
  $scope.shippingDetails = {};
  $scope.servicePackageList = {};

  $scope.provinces = {};
  $scope.cities = {};
  $scope.districts = {};
  
  if ($scope.arrayOfShippingDetails) {
    $scope.shippingDetails = $scope.arrayOfShippingDetails[$scope.selectedShippingDetails];
    console.log($scope.selectedShippingDetails)
  }

  $scope.addAddress = function(){
    dataFactory.setObject('customerDetails', $scope.customerDetails);
    console.log($scope.customerDetails); 
  }

  $scope.getProvinceList = function() {
    shippingService.getAreaList('province', '').success(function(data){
      $scope.provinces = data;
    });
    console.log($scope.provinces);
  }

  $scope.getCityList = function() {
    $scope.shippingDetails.city = '';
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

  $scope.getFare = function(shippingDetails) {
    console.log(shippingDetails);
    if ($scope.shippingDetails){
      $http.post(
        //url
        phinisiEndpoint + '/package/fare',
        //data
        {
          "product_id": $scope.productDetails.id,
          "destination_district_id": shippingDetails.district.id,
          "quantity": $scope.productDetails.qty
        },
        //config
        {
          headers :{ 'Content-Type': 'application/json','Accept': 'application/json'}
        }
      )
      .success(function(data){
        console.log(data);
        $scope.servicePackageList = data.expedition[0].expedition_service;
        $scope.serviceDetails.servicePackage = $scope.servicePackageList[0];
        $scope.errorMessageShipping = null;  
       
      })
      .error(function(data){
        $scope.error = data.description;
        $state.transitionTo('500', { arg: 'arg'});        
      })
    }
  }

  $scope.gotoTop = function() {
    $location.hash('progress-tracker');
    $anchorScroll();
  }

  $scope.onSubmit = function(){
    console.log($scope.customerDetails);
    if ($scope.form.customerForm.$valid){
      if ($scope.productDetails.need_address){
        if ($scope.arrayOfShippingDetails != null) {
          if ($scope.serviceDetails.insurance) {
            $scope.serviceDetails.shippingCost = $scope.serviceDetails.servicePackage.service_fare_with_issurance;
          } 
          else {
            $scope.serviceDetails.shippingCost = $scope.serviceDetails.servicePackage.service_fare;
          }
          dataFactory.setObject('customerDetails', $scope.customerDetails);
          dataFactory.setObject('shippingDetails', $scope.shippingDetails);
          dataFactory.setObject('serviceDetails', $scope.serviceDetails);
          dataFactory.set('selectedShippingDetails', $scope.selectedShippingDetails);
          $state.transitionTo('payment.paymentDetails', { arg: 'arg'});
        }
        else {
          $scope.errorMessageShipping = "Silahkan pilih alamat tujuan Anda terlebih dahulu!";   
        }
      }
      else {
        dataFactory.setObject('customerDetails', $scope.customerDetails);
        $state.transitionTo('payment.paymentDetails', { arg: 'arg'});
      }
    }
    else {
      $scope.errorMessage = "Form tidak valid. Silahkan pastikan bahwa form telah terisi dengan benar sebelum melanjutkan ke tahap berikutnya.";
    }

  }

}]);

paymentApp.controller('addAddressController', ['$scope', '$http', '$log', '$state', 'dataFactory', 'shippingService', function($scope, $http, $log, $state, dataFactory, shippingService){

  $scope.shippingDetails = {
    full_name: dataFactory.getObject('customerDetails').full_name,
    phone_number: dataFactory.getObject('customerDetails').phone_number
  };
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.provinces = {};
  $scope.cities = {};
  $scope.districts = {};
  $scope.arrayOfShippingDetails = dataFactory.getObject('arrayOfShippingDetails') || [];

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
        if (data.expedition) {
          $scope.arrayOfShippingDetails.push($scope.shippingDetails);
          dataFactory.set('selectedShippingDetails', $scope.arrayOfShippingDetails.indexOf($scope.shippingDetails));
          dataFactory.setObject('arrayOfShippingDetails', $scope.arrayOfShippingDetails);
          $state.transitionTo('payment.shippingDetails', { arg: 'arg' });  
        }
        else {
          $scope.errorMessageShipping = "Alamat tujuan tidak didukung. Silahkan pilih alamat yang lain.";
        }
      })
      .error(function(data){
        $scope.error = data.description;
        $state.transitionTo('500', { arg: 'arg'});        
      })

    }
  };

}]);