paymentApp.config(function($sceDelegateProvider, $httpProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://api.sandbox.veritrans.co.id/v2/**'
  ]);

  Veritrans.url = "https://api.sandbox.veritrans.co.id/v2/token";
  
  // The blacklist overrides the whitelist so the open redirect here is blocked.
  // $sceDelegateProvider.resourceUrlBlacklist([
  //   'http://myapp.example.com/clickThru**'
  // ]);
  // We need to setup some parameters for http requests
  // These three lines are all you need for CORS support
  // $httpProvider.defaults.useXDomain = true;
  // $httpProvider.defaults.withCredentials = true;
  // delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

//Factory
paymentApp.value('PaymentTypes', [{
    display_name: "Kartu Kredit",
    payment_type: "credit_card",
    image_class: "fa fa-lg fa-credit-card"
  },{
    display_name: "Bank Transfer",
    payment_type: "permata",
    image_class: "fa fa-lg fa-diamond"
  } ]
);

paymentApp.controller('paymentDetailsController', ['$scope', '$http', '$log', '$state', 'PaymentTypes', '$stateParams', 'dataFactory', function($scope, $http, $log, $state, PaymentTypes, $stateParams, dataFactory){
  $scope.$parent.state = 3;
  $scope.payments = PaymentTypes;
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.serviceDetails = dataFactory.getObject('serviceDetails');

  $scope.paymentType = {
    display_name: "Credit Card",
    payment_type: "credit_card",
    image_class: "fa fa-lg fa-credit-card"
  }; 

  $scope.go = function (paymentType) {
    if (paymentType === 'credit_card') {
      $state.transitionTo('payment.paymentDetails.creditCard', {arg : 'arg'});
    }
    else if (paymentType === 'permata'){
      $state.transitionTo('payment.paymentDetails.bankTransfer', {arg : 'arg'});
    }
    else {

    }  
  };
}]);

paymentApp.controller('creditCardController', ['$scope', '$http', '$log', '$state', '$stateParams', 'dataFactory', function($scope, $http, $log, $state, $stateParams, dataFactory){
  $scope.creditCard = {
    card_number: '5211111111111117',
    card_cvv: '123',
    card_exp_date: '12/2018'
  };

  var shippingDetails = {};
  var serviceDetails = {};

  var card = function() {
    var shippingCost = (dataFactory.getObject('productDetails').need_address ? dataFactory.getObject('serviceDetails').shippingCost : 0);
    return {
      'card_number': $scope.creditCard.card_number,
      'card_cvv': $scope.creditCard.card_cvv,
      'card_exp_month': $scope.creditCard.card_exp_date.substr(0, 2),
      'card_exp_year': $scope.creditCard.card_exp_date.substr(3, 4),
      'secure': true,
      'gross_amount': dataFactory.getObject('productDetails').price + shippingCost
    }
  }

  $scope.errorMessage = dataFactory.get('errorMessage');

  $scope.getToken = function(){
    $state.transitionTo('payment.loading', { paymentStatus: 'charge-loading'});
    $scope.getClientKey();
    setTimeout(function(){
      Veritrans.token(card, callback);
    }, 1000);
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
      console.log($scope.paymentStatus);
      $state.transitionTo('payment.loading', { paymentStatus: 'charge-loading'});
      $scope.chargeTransaction(response);
    }
    else {
      // Failed request token
      dataFactory.set('errorMessage', response.status_message)
      $state.transitionTo('payment.paymentDetails', { arg: 'arg'})
    }
    console.log($scope.response);
    console.log($scope.paymentStatus);
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
      shippingDetails = {
        "full_name": dataFactory.getObject('shippingDetails').full_name,
        "address": dataFactory.getObject('shippingDetails').address,
        "phone": dataFactory.getObject('shippingDetails').phone_number,
        "district_id": dataFactory.getObject('shippingDetails').district.id
      };
      serviceDetails = {
        "include_shipping_insurance": dataFactory.getObject('serviceDetails').insurance,
        "shipping_service_id": dataFactory.getObject('serviceDetails').servicePackage.service_id 
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
            save_token_id : false
          },
          customer_details : {
            "first_name": dataFactory.getObject('customerDetails').full_name,
            "email": dataFactory.getObject('customerDetails').email,
            "phone": '+62' + dataFactory.getObject('customerDetails').phone_number,
            "shipping_address": shippingDetails
          }        
        }, serviceDetails),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).success(function(data, status, headers, config) {
        console.log(data);
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
        console.log(response);
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

  $scope.chargeBankTransfer = function(){
    if (dataFactory.getObject('productDetails').need_address){
      shippingDetails = {
        "first_name": dataFactory.getObject('shippingDetails').full_name.split(' ').slice(0, -1).join(' '),
        "last_name": dataFactory.getObject('shippingDetails').full_name.split(' ').slice(-1).join(' '),
        "address": dataFactory.getObject('shippingDetails').address,
        "phone": '+62' + dataFactory.getObject('shippingDetails').phone_number,
        "district_id": dataFactory.getObject('shippingDetails').district.id
      };
      serviceDetails = {
        "include_shipping_insurance": dataFactory.getObject('serviceDetails').insurance,
        "shipping_service_id": dataFactory.getObject('serviceDetails').servicePackage.service_id 
      };
    }
    dataFactory.set('paymentType', 'Bank Transfer');
    $state.transitionTo('payment.loading', { paymentStatus: 'charge-loading'});
    console.log(dataFactory.getObject('productDetails').qty);
    $http.post(
        //url
        phinisiEndpoint + '/charge',
        //data
        angular.extend({
          payment_type : "bank_transfer",
          item_details : [ {
            "id" : dataFactory.getObject('productDetails').id,
            "price" : dataFactory.getObject('productDetails').price,
            "quantity" : dataFactory.getObject('productDetails').qty,
            "name" : dataFactory.getObject('productDetails').name
          } ],
          customer_details : {
            "first_name": dataFactory.getObject('customerDetails').full_name.split(' ').slice(0, -1).join(' '),
            "last_name": dataFactory.getObject('customerDetails').full_name.split(' ').slice(-1).join(' '),
            "phone": '+62' + dataFactory.getObject('customerDetails').phone_number,
            "email": dataFactory.getObject('customerDetails').email,
            "shipping_address": shippingDetails
          }
          
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
        console.log(response);
        $state.transitionTo('500', { arg: 'arg' });
      });
  }

}]);
