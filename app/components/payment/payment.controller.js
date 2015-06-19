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
    display_name: "BBM Money",
    payment_type: "bbm_money",
    image_class: "bbm-logo"
  }, {
    display_name: "Credit Card",
    payment_type: "credit_card",
    image_class: "fa fa-lg fa-credit-card"
  },{
    display_name: "Bank Transfer",
    payment_type: "permata",
    image_class: "fa fa-lg fa-diamond"
  } ]
);

paymentApp.controller('paymentController', ['$scope', '$http', '$log', '$state', 'PaymentTypes', '$stateParams', 'dataFactory', function($scope, $http, $log, $state, PaymentTypes, $stateParams, dataFactory){
  $scope.payments = PaymentTypes;
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');

  $scope.paymentType = {
    display_name: "Credit Card",
    payment_type: "credit_card",
    image_class: "fa fa-lg fa-credit-card"
  }; 

  $scope.go = function (paymentType) {
    console.log('go ' + paymentType);
    if (paymentType === 'credit_card') {
      $state.transitionTo('paymentDetails.creditCard', {arg : 'arg'});
    }
    else if (paymentType === 'permata'){
      $state.transitionTo('paymentDetails.bankTransfer', {arg : 'arg'});
    }
    else if (paymentType === 'paymentDetails.bbmMoney'){
      $state.transitionTo('paymentDetails.bbmMoney', {arg : 'arg'});
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

  $scope.errorMessage = dataFactory.get('errorMessage');

  $scope.getToken = function(){
    dataFactory.setObject('creditCard', {
      'card_number': $scope.creditCard.card_number,
      'card_cvv': $scope.creditCard.card_cvv,
      'card_exp_month': $scope.creditCard.card_exp_date.substr(0, 2),
      'card_exp_year': $scope.creditCard.card_exp_date.substr(3, 4),
      'secure': true,
      'gross_amount': dataFactory.getObject('productDetails').totalAmount
    });
    dataFactory.getObject('creditCard');
    dataFactory.set('paymentType', 'Credit Card');
    $state.transitionTo('loading', { arg: 'arg'});
  }

}]);

paymentApp.controller('loadingController', ['$scope', '$http', '$log', '$state', '$stateParams', 'dataFactory', function($scope, $http, $log, $state, $stateParams, dataFactory){
  
  var card = function(){
    return dataFactory.getObject('creditCard');
  }
  
  function callback(response) {
    console.log(response);
    if (response.redirect_url) {
      console.log("3D SECURE");
      $scope.$apply(function(){
        $scope.response = response;
        $scope.paymentStatus = '3d-secure-loading';
      });
    }
    else if (response.status_code == "200") {
      console.log("NOT 3-D SECURE");
      // Success 3-D Secure or success normal
      console.log($scope.paymentStatus);
      $scope.$apply(function(){
        $scope.paymentStatus = 'charge-loading';
      });
      $scope.chargeTransaction(response);
    }
    else {
      // Failed request token
      dataFactory.set('errorMessage', response.status_message)
      $state.transitionTo('paymentDetails', { arg: 'arg'})
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
    var shippingDetails = {};
    if (dataFactory.getObject('productDetails').need_address){
      shippingDetails = {
        "full_name": dataFactory.getObject('shippingDetails').full_name,
        "address": dataFactory.getObject('shippingDetails').address,
        "phone": dataFactory.getObject('shippingDetails').phone_number,
        "district_id": dataFactory.getObject('shippingDetails').district.id
      }
      console.log(shippingDetails);
    }

    $http.post(
        //url
        phinisiEndpoint + '/charge',
        //data
        {
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
        },
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
            $state.transitionTo('paymentFinish', {'data': data})
           
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

  $scope.loadInit = function(){
    $scope.getClientKey();
    if (dataFactory.get('paymentType') == 'Credit Card'){
      console.log(dataFactory.getObject('creditCard'));
      setTimeout(function(){
        Veritrans.token(card, callback);
      }, 1000);
    }
    else if (dataFactory.get('paymentType') == 'Bank Transfer'){
      $scope.paymentStatus = 'charge-loading';
      console.log($scope.paymentStatus);
    }
    
  }

  $scope.loadFinish = function(){
    setTimeout(function() {
      $scope.$apply(function(){
        $scope.paymentStatus = '3d-secure';
      })
    }, 1000);    
  }

}]);

paymentApp.controller('bankTransferController', ['$scope','$http', '$log', '$state', 'dataFactory', function($scope, $http, $log, $state, dataFactory){


  $scope.chargeBankTransfer = function(){
    var shippingDetails = {};
    if (dataFactory.getObject('productDetails').need_address){
      shippingDetails = {
        "full_name": dataFactory.getObject('shippingDetails').full_name,
        "address": dataFactory.getObject('shippingDetails').address,
        "phone": dataFactory.getObject('shippingDetails').phone_number,
        "district_id": dataFactory.getObject('shippingDetails').district.id
      }
      console.log(shippingDetails);
    }
    dataFactory.set('paymentType', 'Bank Transfer');
    $state.transitionTo('loading', { arg: 'arg'});
    $http.post(
        //url
        phinisiEndpoint + '/charge',
        //data
        {
          payment_type : "bank_transfer",
          item_details : [ {
            "id" : dataFactory.getObject('productDetails').id,
            "price" : dataFactory.getObject('productDetails').price,
            "quantity" : dataFactory.getObject('productDetails').qty,
            "name" : dataFactory.getObject('productDetails').name
          } ],
          customer_details : {
            "first_name": dataFactory.getObject('customerDetails').full_name,
            "phone": '+62' + dataFactory.getObject('customerDetails').phone_number,
            "email": dataFactory.getObject('customerDetails').email,
            "shipping_address": shippingDetails
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).success(function(data, status, headers, config) {

        console.log(data)
        dataFactory.setObject('transactionDetails', data);
        setTimeout(function() {
            $state.transitionTo('paymentFinish', { arg: 'arg' });
        }, 1000);    

      }).
      error(function(data, status, headers, config) {
        console.log(response);
        $state.transitionTo('500', { arg: 'arg' });
      });
  }

}]);

paymentApp.controller('paymentFinishController', ['$scope','$http', '$log', '$state', 'dataFactory', function($scope, $http, $log, $state, dataFactory){
  $scope.transactionDetails = dataFactory.getObject('transactionDetails');
  $scope.shippingDetails = dataFactory.getObject('shippingDetails');
  $scope.customerDetails = dataFactory.getObject('customerDetails');
  $scope.productDetails = dataFactory.getObject('productDetails');
}]);

// paymentApp.directive('loading', function ($http) {
//   return {
//       restrict: 'A',
//       link: function (scope, elm, attrs)
//       {
//           scope.isLoading = function () {
//               return $http.pendingRequests.length > 0;
//           };

//           scope.$watch(scope.isLoading, function (v)
//           {
//               if(v){
//                   $(elm).show();
//               }else{
//                   $(elm).hide();
//               }
//           });
//       }
//   };
// });