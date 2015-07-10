paymentApp.controller('shippingController', ['$scope', '$http', '$log', '$state', 'dataFactory', 'shippingService', '$location', '$anchorScroll', function($scope, $http, $log, $state, dataFactory, shippingService, $location, $anchorScroll){
  $scope.$parent.state = 2;
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.arrayOfShippingDetails = dataFactory.getObject('arrayOfShippingDetails') || [];
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.serviceDetails = {};
  $scope.shippingDetails = {};
  $scope.servicePackageList = {};

  if(!$scope.customerDetails){
    $scope.customerDetails = {
      expressPayment: true
    }
  }

  $scope.provinces = {};
  $scope.cities = {};
  $scope.districts = {};
  
  if ($scope.arrayOfShippingDetails) {
    $scope.shippingDetails = $scope.arrayOfShippingDetails[0];
    $scope.selectedShippingDetails = 0;
  }

  if ($scope.productDetails.insurance_type == "NOT_NEEDED"){
    $scope.serviceDetails.insurance = false;
  }
  else if ($scope.productDetails.insurance_type == 'NEEDED'){
    $scope.serviceDetails.insurance = true;
  }
  
  $scope.editShippingDetails = function(index){
    dataFactory.setObject('shippingDetails', $scope.arrayOfShippingDetails[index]);
    console.log($scope.arrayOfShippingDetails[index]);
    $state.transitionTo('payment.addAddress', {arg: 'arg'});
  }

  $scope.deleteShippingDetails = function(index){
    $scope.arrayOfShippingDetails.splice(index, 1);
    $scope.shippingDetails = $scope.arrayOfShippingDetails[0];
  }

  $scope.$watch('selectedShippingDetails', function(){
    console.log($scope.selectedShippingDetails);
    if ($scope.selectedShippingDetails >= 0){
      // assign to selected address
      $scope.shippingDetails = $scope.arrayOfShippingDetails[$scope.selectedShippingDetails];
      $scope.getFare($scope.shippingDetails);
    }
    else {
      // reset to new address
      $scope.shippingDetails = {};
      $scope.serviceDetails = {};
      $scope.servicePackageList = {};
    }
  });

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
        if (data.expedition){
          $scope.servicePackageList = data.expedition[0].expedition_service;
          $scope.serviceDetails.servicePackage = $scope.servicePackageList[0];
          $scope.serviceDetails.insurance = false;
          $scope.errorMessageShipping = null;
        } 
        else {
          $scope.servicePackageList = {};
          $scope.serviceDetails.servicePackage = null;
          $scope.errorMessageShipping = "Alamat tujuan tidak didukung. Silahkan pilih alamat yang lain.";
          $location.hash('error-message-shipping');
          $anchorScroll();
        }
      })
      .error(function(data){
        $scope.error = data.description;
        $state.transitionTo('500', { arg: 'arg'});        
      })
    }
  }

  $scope.onSubmit = function(){
    if ($scope.arrayOfShippingDetails.length == 0){
      //First time user
      if ($scope.productDetails.need_address) {
        // Product need address
        if ($scope.form.shippingForm.$valid) {
          // Shipping Form valid
          if ($scope.serviceDetails.insurance) {
            $scope.serviceDetails.shippingCost = $scope.serviceDetails.servicePackage.service_fare_with_issurance;
          } 
          else {
            $scope.serviceDetails.shippingCost = $scope.serviceDetails.servicePackage.service_fare;
          }
          $scope.arrayOfShippingDetails.push($scope.shippingDetails);
          dataFactory.setObject('customerDetails', $scope.customerDetails);
          dataFactory.setObject('shippingDetails', $scope.shippingDetails);
          dataFactory.setObject('serviceDetails', $scope.serviceDetails);
          dataFactory.setObject('arrayOfShippingDetails', $scope.arrayOfShippingDetails);
          $state.transitionTo('payment.paymentDetails', { arg: 'arg'});
        }
        else if ($scope.form.shippingForm.$invalid) {
          // Add new address and shipping form not valid
          $scope.errorMessageShipping = "Form tidak valid. Silahkan pastikan bahwa form telah terisi dengan benar sebelum melanjutkan ke tahap berikutnya.";
        }
      }
      else {
        //Product doesn't need address
        if ($scope.form.customerForm.$valid){
          // Customer Form valid
          dataFactory.setObject('customerDetails', $scope.customerDetails);
          $state.transitionTo('payment.paymentDetails', { arg: 'arg'});  
        }
        else {
          //CustomerForm is invalid
          $scope.errorMessage = "Form tidak valid. Silahkan pastikan bahwa form telah terisi dengan benar sebelum melanjutkan ke tahap berikutnya.";
        }
      }
    }
    else if ($scope.arrayOfShippingDetails.length > 0){
      //Second Time User
      if ($scope.productDetails.need_address){
        if ($scope.selectedShippingDetails > -1){
          //Current Address or Saved Address
          if ($scope.serviceDetails.insurance) {
            $scope.serviceDetails.shippingCost = $scope.serviceDetails.servicePackage.service_fare_with_issurance;
          } 
          else {
            $scope.serviceDetails.shippingCost = $scope.serviceDetails.servicePackage.service_fare;
          }
          var currentIndex = $scope.arrayOfShippingDetails.indexOf($scope.shippingDetails);
          var temp = $scope.arrayOfShippingDetails[0];
          $scope.arrayOfShippingDetails[0] = $scope.arrayOfShippingDetails[currentIndex];
          $scope.arrayOfShippingDetails[currentIndex] = temp;
          console.log($scope.arrayOfShippingDetails);
          dataFactory.setObject('arrayOfShippingDetails', $scope.arrayOfShippingDetails);
          dataFactory.setObject('customerDetails', $scope.customerDetails);
          dataFactory.setObject('shippingDetails', $scope.shippingDetails);
          dataFactory.setObject('serviceDetails', $scope.serviceDetails);
          $state.transitionTo('payment.paymentDetails', { arg: 'arg'});
        }
        else if ($scope.selectedShippingDetails == -1 && $scope.form.shippingForm.$valid){
          //New Address
          if ($scope.serviceDetails.insurance) {
            $scope.serviceDetails.shippingCost = $scope.serviceDetails.servicePackage.service_fare_with_issurance;
          } 
          else {
            $scope.serviceDetails.shippingCost = $scope.serviceDetails.servicePackage.service_fare;
          }
          $scope.arrayOfShippingDetails.unshift($scope.shippingDetails); //put shippingDetails in the first index
          console.log($scope.arrayOfShippingDetails);
          dataFactory.setObject('arrayOfShippingDetails', $scope.arrayOfShippingDetails);
          dataFactory.setObject('customerDetails', $scope.customerDetails);
          dataFactory.setObject('shippingDetails', $scope.shippingDetails);
          dataFactory.setObject('serviceDetails', $scope.serviceDetails);
          $state.transitionTo('payment.paymentDetails', { arg: 'arg'});
        }
        else if ($scope.selectedShippingDetails == -1 && $scope.form.shippingForm.$invalid){
          //New Address and shipping form not valid
          $scope.errorMessageShipping = "Form tidak valid. Silahkan pastikan bahwa form telah terisi dengan benar sebelum melanjutkan ke tahap berikutnya.";
        }
      }
      else {
        //Product doesn't need address
        if ($scope.form.customerForm.$valid){
          // Customer Form valid
          dataFactory.setObject('customerDetails', $scope.customerDetails);
          $state.transitionTo('payment.paymentDetails', { arg: 'arg'});  
        }
        else {
          //CustomerForm is invalid
          $scope.errorMessage = "Form tidak valid. Silahkan pastikan bahwa form telah terisi dengan benar sebelum melanjutkan ke tahap berikutnya.";
        }
      } 
    }
  }

}]);

paymentApp.controller('addAddressController', ['$scope', '$http', '$log', '$state', 'dataFactory', 'shippingService', function($scope, $http, $log, $state, dataFactory, shippingService){

  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.provinces = {};
  $scope.cities = {};
  $scope.districts = {};
  $scope.arrayOfShippingDetails = dataFactory.getObject('arrayOfShippingDetails');

  $scope.shippingDetailsIndex = $scope.arrayOfShippingDetails.indexOf($scope.shippingDetails);
  
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
          // Remove selected shipping details from array
          $scope.arrayOfShippingDetails.splice($scope.shippingDetailsIndex, 1);
          // Then push it into the first element of the array
          $scope.arrayOfShippingDetails.unshift($scope.shippingDetails);
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