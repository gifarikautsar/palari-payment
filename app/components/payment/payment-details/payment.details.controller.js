//Factory
paymentApp.value('PaymentTypes', [{
    display_name: "Kartu Kredit",
    payment_type: "credit_card",
    image_class: "fa fa-lg fa-credit-card"
  },{
    display_name: "Bank Transfer",
    payment_type: "permata",
    image_class: "fa fa-lg fa-diamond"
  },{
    display_name: "BBM Money",
    payment_type: "bbm_money",
    image_class: "bbm-logo"
  } ]
);

paymentApp.controller('paymentDetailsController', ['$scope', '$http', '$log', '$state', 'PaymentTypes', '$stateParams', 'dataFactory', function($scope, $http, $log, $state, PaymentTypes, $stateParams, dataFactory){
  $scope.$parent.state = 3;
  $scope.payments = PaymentTypes;
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.serviceDetails = dataFactory.getObject('serviceDetails');
  $scope.arrayOfShippingDetails = dataFactory.getObject('arrayOfShippingDetails');

  $scope.setDefaultPayment = function() {
    if (dataFactory.get('paymentType') == 'bank_transfer'){
      $scope.paymentType = { 
        display_name: "Bank Transfer",
        payment_type: "permata",
        image_class: "fa fa-lg fa-diamond"
      }; 
    }
    else if (dataFactory.get('paymentType') == 'credit_card'){
      $scope.paymentType = {
        display_name: "Kartu Kredit",
        payment_type: "credit_card",
        image_class: "fa fa-lg fa-credit-card"
      }; 
    } else {
      $scope.paymentType = {
        display_name: "BBM Money",
        payment_type: "bbm_money",
        image_class: "bbm-logo"
      };
    }
    $scope.go($scope.paymentType.payment_type);
  }

  $scope.go = function (paymentType) {
    if (paymentType === 'credit_card') {
      $state.transitionTo('payment.paymentDetails.creditCard', {arg : 'arg'});
    }
    else if (paymentType === 'permata'){
      $state.transitionTo('payment.paymentDetails.bankTransfer', {arg : 'arg'});
    }
    else {
      $state.transitionTo('payment.paymentDetails.bbmMoney', {arg : 'arg'});
    }  
  };
}]);

paymentApp.controller('creditCardController', ['$scope', '$http', '$log', '$state', '$stateParams', 'dataFactory', function($scope, $http, $log, $state, $stateParams, dataFactory){
  $scope.creditCard = {
    card_number: '5211111111111117',
    card_cvv: '123',
    card_exp_date: '12/2018'
  };
  $scope.useSavedToken = false;
  $scope.haveSavedToken = false;
  $scope.saved_token = dataFactory.get('saved_token_id');
  $scope.fourDigits = dataFactory.get('cardLastDigit');

  $scope.checkSaved = function(){
    if(($scope.saved_token && $scope.fourDigits) && $scope.saved_token !==null && $scope.fourDigits != null && $scope.saved_token!== 'undefined' && $scope.fourDigits!== 'undefined'){
      $scope.useSavedToken = true;
      $scope.haveSavedToken = true;
    }
    else{
      $scope.useSavedToken = false;
      $scope.haveSavedToken = false;
    }
  }

  var shippingDetails = {};
  var serviceDetails = {};

  var card = function() {
    var shippingCost = (dataFactory.getObject('productDetails').need_address ? dataFactory.getObject('serviceDetails').shippingCost : 0);
    if($scope.useSavedToken){
      return{
        'token_id': $scope.saved_token,
        'card_cvv': $scope.creditCard.card_cvv,
        'two_click' : true,
        'secure' : true,
        'gross_amount': dataFactory.getObject('productDetails').price + shippingCost
      }
    }
    else{
      return {
        'card_number': $scope.creditCard.card_number,
        'card_cvv': $scope.creditCard.card_cvv,
        'card_exp_month': $scope.creditCard.card_exp_date.substr(0, 2),
        'card_exp_year': $scope.creditCard.card_exp_date.substr(3, 4),
        'secure': true,
        'gross_amount': dataFactory.getObject('productDetails').price + shippingCost
      }
    }
  }

  $scope.errorMessage = dataFactory.get('errorMessage');
  $scope.getToken = function(){
    $scope.formValid = false;
    if($scope.useSavedToken){
      if ($scope.savedCreditCardForm.$valid) {
        $scope.formValid = true;
      }
    }
    else{
      if($scope.creditCardForm.$valid){
        $scope.formValid = true;
      }
    }
    if($scope.formValid){
      $state.transitionTo('payment.loading', { paymentStatus: 'charge-loading'});
      Veritrans.url = veritransEndpoint + '/token';
      $scope.getClientKey();
      setTimeout(function(){
        Veritrans.token(card, callback);
      }, 1000);
    }
  }

  function callback(response) {
    console.log(response);
    if (response.redirect_url) {
      console.log("3D SECURE");
      $state.transitionTo('payment.loading', { paymentStatus: '3d-secure-loading', response: response});        
    }
    else if (response.status_code == "200") {
      console.log("NOT 3-D SECURE");
      // Success 3-D Secure or success normal
      $state.transitionTo('payment.loading', { paymentStatus: 'charge-loading'});
      $scope.chargeTransaction(response);
    }
    else {
      // Failed request token
      dataFactory.set('errorMessage', response.status_message)
      $state.transitionTo('payment.paymentDetails', { arg: 'arg'})
    }
    console.log("callback");
  }

  $scope.getClientKey = function(){
    $http.get(
      //url
      phinisiEndpoint + '/customer/clientkey/' + dataFactory.getObject('productDetails').id,
      //config
      {
        headers :{ 'Content-Type': 'application/json','Accept': 'application/json'} ,       
      }
    )   
    .success(function(data){
      console.log(data.client_key);
      Veritrans.client_key = data.client_key;      
    })
    .error(function(data){
      $scope.error = data.description;
      $state.transitionTo('500', { arg: 'arg'});        
    });
  }

  $scope.chargeTransaction = function(response) {
    if (dataFactory.getObject('productDetails').need_address){
      customerDetails = {
        first_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(0, -1).join(' '),
        last_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(-1).join(' '),
        phone: '+62' + dataFactory.getObject('shippingDetails').phone_number,
        email: dataFactory.getObject('shippingDetails').email,
        shipping_address: {
          first_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(0, -1).join(' '),
          last_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(-1).join(' '),
          address: dataFactory.getObject('shippingDetails').address,
          phone: '+62' + dataFactory.getObject('shippingDetails').phone_number,
          district_id: dataFactory.getObject('shippingDetails').district.id,
          postal_code: dataFactory.getObject('shippingDetails').postal_code
        }
      };
      serviceDetails = {
        include_shipping_insurance: dataFactory.getObject('serviceDetails').insurance,
        shipping_service_id: dataFactory.getObject('serviceDetails').servicePackage.service_id 
      };
    } else {
      //Product doesn't need address
      customerDetails = {
        first_name: dataFactory.getObject('customerDetails').full_name.split(' ').slice(0, -1).join(' '),
        last_name: dataFactory.getObject('customerDetails').full_name.split(' ').slice(-1).join(' '),
        phone: '+62' + dataFactory.getObject('customerDetails').phone_number,
        email: dataFactory.getObject('customerDetails').email
      };
    }

    $http.post(
        //url
        phinisiEndpoint + '/charge',
        //data
        angular.extend({
          payment_type : "credit_card",
          item_details : [ {
            "id" : dataFactory.getObject('productDetails').id,
            "price" : dataFactory.getObject('productDetails').price,
            "quantity" : dataFactory.getObject('productDetails').qty,
            "name" : dataFactory.getObject('productDetails').name
          } ],
          credit_card : {
            token_id : response.token_id,
            save_token_id : dataFactory.getObject('customerDetails').expressPayment
          },
          customer_details : customerDetails
        }, serviceDetails),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).success(function(data, status, headers, config) {
        console.log('Charging-------');
        console.log(data);
        if($scope.useSavedToken){
          dataFactory.set('cardLastDigit', $scope.fourDigits);  
          dataFactory.set('saved_token_id', $scope.saved_token);
        }
        else{
          dataFactory.set('cardLastDigit', $scope.creditCard.card_number.substr($scope.creditCard.card_number.length-4,$scope.creditCard.card_number.length));
          dataFactory.set('saved_token_id', data.saved_token_id);
        }
        dataFactory.setObject('transactionDetails', data);
        //Confirm Transaction
        $http.post(
          phinisiEndpoint + '/merchant/payment/confirm', 
          {
            order_id : data.order_id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        ).success(function(data, status, headers, config){
            console.log(data);
            dataFactory.setObject('customerDetails', $scope.$parent.customerDetails);
            $state.transitionTo('payment.paymentFinish', {'data': data})
           
        }).error(function(data, status, headers, config){
            console.log(data);
            $state.transitionTo('500', { arg: 'arg' });
        });

      }).
      error(function(data, status, headers, config) {
        console.log(data);
        $state.transitionTo('500', { arg: 'arg' });
      });
  }

}]);

paymentApp.controller('loadingController', ['$scope', '$http', '$log', '$state', '$stateParams', 'dataFactory', function($scope, $http, $log, $state, $stateParams, dataFactory){
  $scope.paymentStatus = $stateParams.paymentStatus;
  $scope.response = $stateParams.response;

  $scope.loadFinish = function(){
    setTimeout(function() {
      $scope.$apply(function(){
        $scope.paymentStatus = '3d-secure';
      })
    }, 1000);    
  }

}]);

paymentApp.controller('bankTransferController', ['$scope','$http', '$log', '$state', 'dataFactory', function($scope, $http, $log, $state, dataFactory){

  var shippingDetails = {};
  var serviceDetails = {};

  $scope.chargeBankTransfer = function(){    if (dataFactory.getObject('productDetails').need_address){
    customerDetails = {
        first_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(0, -1).join(' '),
        last_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(-1).join(' '),
        phone: '+62' + dataFactory.getObject('shippingDetails').phone_number,
        email: dataFactory.getObject('shippingDetails').email,
        shipping_address: {
          first_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(0, -1).join(' '),
          last_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(-1).join(' '),
          address: dataFactory.getObject('shippingDetails').address,
          phone: '+62' + dataFactory.getObject('shippingDetails').phone_number,
          district_id: dataFactory.getObject('shippingDetails').district.id,
          postal_code: dataFactory.getObject('shippingDetails').postal_code
        }
      };
      serviceDetails = {
        include_shipping_insurance: dataFactory.getObject('serviceDetails').insurance,
        shipping_service_id: dataFactory.getObject('serviceDetails').servicePackage.service_id 
      };
    } else {
      //Product doesn't need address
      customerDetails = {
        first_name: dataFactory.getObject('customerDetails').full_name.split(' ').slice(0, -1).join(' '),
        last_name: dataFactory.getObject('customerDetails').full_name.split(' ').slice(-1).join(' '),
        phone: '+62' + dataFactory.getObject('customerDetails').phone_number,
        email: dataFactory.getObject('customerDetails').email
      };
    }
    dataFactory.set('paymentType', 'Bank Transfer');
    $state.transitionTo('payment.loading', { paymentStatus: 'charge-loading'});
    $http.post(
        //url
        phinisiEndpoint + '/charge',
        //data
        angular.extend({
          payment_type : "bank_transfer",
          item_details : [ {
            id : dataFactory.getObject('productDetails').id,
            price : dataFactory.getObject('productDetails').price,
            quantity : dataFactory.getObject('productDetails').qty,
            name : dataFactory.getObject('productDetails').name
          } ],
          customer_details : customerDetails
        },serviceDetails),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).success(function(data, status, headers, config) {
        console.log(data)
        dataFactory.setObject('transactionDetails', data);

        //Confirm Transaction
        $http.post(
          phinisiEndpoint + '/merchant/payment/confirm', 
          {
            order_id : data.order_id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        ).success(function(data, status, headers, config){
            console.log(data);
            $state.transitionTo('payment.paymentFinish', {'data': data})
           
        }).error(function(data, status, headers, config){
            console.log(data);
            $state.transitionTo('500', { arg: 'arg' });
        });
      }).
      error(function(data, status, headers, config) {
        console.log(data);
        $state.transitionTo('500', { arg: 'arg' });
      });
  }

}]);

paymentApp.controller('bbmMoneyController', ['$scope','$http', '$log', '$state', 'dataFactory', function($scope, $http, $log, $state, dataFactory){

  var shippingDetails = {};
  var serviceDetails = {};

  $scope.chargeBbmMoney = function(){
    if (dataFactory.getObject('productDetails').need_address){
      customerDetails = {
        first_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(0, -1).join(' '),
        last_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(-1).join(' '),
        phone: '+62' + dataFactory.getObject('shippingDetails').phone_number,
        email: dataFactory.getObject('shippingDetails').email,
        shipping_address: {
          first_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(0, -1).join(' '),
          last_name: dataFactory.getObject('shippingDetails').full_name.split(' ').slice(-1).join(' '),
          address: dataFactory.getObject('shippingDetails').address,
          phone: '+62' + dataFactory.getObject('shippingDetails').phone_number,
          district_id: dataFactory.getObject('shippingDetails').district.id,
          postal_code: dataFactory.getObject('shippingDetails').postal_code
        }
      };
      serviceDetails = {
        include_shipping_insurance: dataFactory.getObject('serviceDetails').insurance,
        shipping_service_id: dataFactory.getObject('serviceDetails').servicePackage.service_id 
      };
    } else {
      //Product doesn't need address
      customerDetails = {
        first_name: dataFactory.getObject('customerDetails').full_name.split(' ').slice(0, -1).join(' '),
        last_name: dataFactory.getObject('customerDetails').full_name.split(' ').slice(-1).join(' '),
        phone: '+62' + dataFactory.getObject('customerDetails').phone_number,
        email: dataFactory.getObject('customerDetails').email
      };
    }
    dataFactory.set('paymentType', 'BBM Money');
    $state.transitionTo('payment.loading', { paymentStatus: 'charge-loading'});
    $http.post(
        //url
        phinisiEndpoint + '/charge',
        //data
        angular.extend({
          payment_type : "bbm_money",
          item_details : [ {
            id : dataFactory.getObject('productDetails').id,
            price : dataFactory.getObject('productDetails').price,
            quantity : dataFactory.getObject('productDetails').qty,
            name : dataFactory.getObject('productDetails').name
          } ],
          customer_details : customerDetails
          
        },serviceDetails),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).success(function(data, status, headers, config) {
        console.log(data)
        if (navigator.userAgent.match(/Android|webOS/i)){
          var bbm_parameter = {
            "reference": data.permata_va_number,
            "callback_url": {
              "check_status": "",
              "before_payment_error": "",
              "user_cancel": ""
            }
          }
          data.bbm_money_url = 'bbmmoney://api/payment/imp?data=' + encodeURIComponent(JSON.stringify(bbm_parameter));
        } else {
          data.bbm_money_url = 'bbmmoney://api/deviceMessage';
        }
        dataFactory.setObject('transactionDetails', data);

        //Confirm Transaction
        $http.post(
          phinisiEndpoint + '/merchant/payment/confirm', 
          {
            order_id : data.order_id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        ).success(function(data, status, headers, config){
            console.log(data);
            $state.transitionTo('payment.paymentFinish', {'data': data})
           
        }).error(function(data, status, headers, config){
            console.log(data);
            $state.transitionTo('500', { arg: 'arg' });
        });
      }).
      error(function(data, status, headers, config) {
        console.log(data);
        $state.transitionTo('500', { arg: 'arg' });
      });
  }

}]);