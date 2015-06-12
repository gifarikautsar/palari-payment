paymentApp.config(function($sceDelegateProvider, $httpProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://api.sandbox.veritrans.co.id/v2/**'
  ]);

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

paymentApp.controller('paymentController', ['$scope', '$http', '$log', '$state', 'PaymentTypes', function($scope, $http, $log, $state, PaymentTypes){
  $scope.payments = PaymentTypes;
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

paymentApp.controller('creditCardController', ['$scope', '$http', '$log', '$state', '$stateParams', function($scope, $http, $log, $state, $stateParams){
  $scope.creditCard = {
    card_number: '5211111111111117',
    card_cvv: '123',
    card_exp_date: '12/2018'
  };

  var card = {
    'card_number': $scope.creditCard.card_number,
    'card_cvv': $scope.creditCard.card_cvv,
    'card_exp_month': $scope.creditCard.card_exp_date.substr(0, 2),
    'card_exp_year': $scope.creditCard.card_exp_date.substr(3, 4),
    'secure': true,
    'gross_amount': 10
  }

  $scope.getToken = function(){
    $state.transitionTo('loading', {'card': card} );
  }

}]);

paymentApp.controller('loadingController', ['$scope', '$http', '$log', '$state', '$stateParams', function($scope, $http, $log, $state, $stateParams){
  
  Veritrans.url = "https://api.sandbox.veritrans.co.id/v2/token";
  Veritrans.client_key = 'VT-client-SimkwEjR3_fKj73D';
  var card = function(){
    return $stateParams.card;
  }

  $scope.chargeTransaction = function(response) {
    $http.post(
        //url
        phinisiEndpoint + '/charge',
        //data
        {
          client_key : "VT-client-SimkwEjR3_fKj73D",
          payment_type : "credit_card",
          item_details : [ {
            "id" : "1",
            "price" : 50000,
            "quantity" : 3,
            "name" : "Baygon rasa jambu batu"
          } ],
          credit_card : {
            token_id : response.token_id,
            save_token_id : false
          },
          customer_details : {
            email : 'dichi@alfaridi.info'
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
        //Confirm Transaction
        $http.post(
          phinisiEndpoint + 'merchant/payment/confirm', 
          {
            client_key : "VT-client-SimkwEjR3_fKj73D",
            transaction_id : data.transaction_id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        ).success(function(data, status, headers, config){
            console.log(data);
            setTimeout(function() {
              $scope.$apply(function(){
                $scope.responseStatus = data;
                $state.transitionTo('paymentFinish', {'data': data})
              })
            }, 10000);
        }).error(function(data, status, headers, config){
            console.log(data);
        });

      }).
      error(function(data, status, headers, config) {
        console.log(response);
      });
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
      $scope.response = 'invalid';
      $scope.statusMessage = response.status_message;
    }
    console.log($scope.response);
    console.log($scope.paymentStatus);
    console.log("callback");
  }

  $scope.loadInit = function(){
    console.log(card);
    Veritrans.token(card, callback);
  }

  $scope.loadFinish = function(){
    if ($scope.paymentStatus == '3d-secure-loading'){
      setTimeout(function() {
        $scope.$apply(function(){
          $scope.paymentStatus = '3d-secure';
        })
      }, 1000);
    }
  }

}]);

paymentApp.controller('permataController', ['$scope','$http', '$log', '$state', function($scope, $http, $log, $state){
  $scope.chargePermata = function(){

  }
}]);

paymentApp.controller("submitController", function($scope, $http, CreditCardService, PaymentTypes){
  $scope.card_exp_date = '12 / 2016';

  $scope.creditCard = {
    card_number: '4811111111111114',
    card_cvv: '123',
    card_exp_month: $scope.card_exp_date.substr(0, 2),
    card_exp_year: $scope.card_exp_date.substr(5, 4)
  };

  $scope.status = 'default';
  $scope.responseStatus = '';
  $scope.statusMessage = '';
  $scope.paymentStatus = 'default';


  $scope.purchasedProducts = [
    { 
      id: "1",
      name: "Baygon rasa jambu batu",
      quantity: 1,
      price: 50000
    }
  ];

  $scope.customerDetails = {
    first_name: "Danny",
    phone: "83199440068",
    email: "noreply@veritrans.co.id",
    billing_address: {
      last_name: "Pranoto",
      address: "Jalan Ciumbuleuit",
      city: "Bandung",
      postal_code: "40141"
    }
  };

  $scope.paymentType = "default";

  $scope.bankType = '';
  $scope.installment = '';

  $scope.totalPrice = function() {
    var total = 0;
    for(var i = 0; i < $scope.purchasedProducts.length; i++){
      total += $scope.purchasedProducts[i].quantity * $scope.purchasedProducts[i].price;
    }
    return total;
  }


  $scope.submit = function() {
    // Sandbox URL
    if ($scope.paymentType.payment_type == 'credit_card'){
      if ($scope.form.creditCardForm.$valid && $scope.form.shippingForm.$valid){
        Veritrans.url = "https://api.sandbox.veritrans.co.id/v2/token";
        Veritrans.client_key = "VT-client-SimkwEjR3_fKj73D";
        var card = function () {
          return {
            "card_number": $scope.creditCard.card_number,
            "card_exp_month": $scope.creditCard.card_exp_month,
            "card_exp_year": $scope.creditCard.card_exp_year,
            "card_cvv": $scope.creditCard.card_cvv,
            "secure": false,
            "gross_amount": $scope.totalPrice()
          }
        };

        function callback(response) {
          console.log(response);
          if (response.redirect_url) {
            console.log("3D SECURE");
            $scope.$apply(function(){
              $scope.responseStatus = response;
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
            $http({
              method: 'POST',
              url: "http://128.199.71.156:8080/v1/charge", 
              data :       {
          client_key : "VT-client-SimkwEjR3_fKj73D",
          payment_type : "credit_card",
          item_details : $scope.purchasedProducts,
          credit_card : {
            token_id : response.token_id,
            save_token_id : false
          },
          customer_details : {
            email : $scope.customerDetails.email
          }
        }
              ,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
              }).
            success(function(response) {
              console.log(response)
              //Confirm Transaction
              $http({
                method: 'POST',
                url: "http://128.199.71.156:8080/v1/merchant/payment/confirm", 
                data : {
                  client_key : "VT-client-SimkwEjR3_fKj73D",
                  transaction_id : response.transaction_id
                },
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              }).
              success(function(response){
                console.log(response);
                setTimeout(function() {
                  $scope.$apply(function(){
                    $scope.responseStatus = response;
                    $scope.paymentStatus = 'complete';
                  })
                }, 10000);
              }).
              error(function(response){
                console.log(response);
              });

            }).
            error(function(response) {
              console.log(response);
            });
          }
          else {
            // Failed request token
            $scope.responseStatus = 'invalid';
            $scope.statusMessage = response.status_message;
          }
          console.log($scope.paymentStatus);
          console.log("callback");

        }

        Veritrans.token(card, callback);        
      }
      else {
        $scope.responseStatus = 'invalid';
        $scope.statusMessage = 'Invalid Form! Please make sure all the details below has been filled and valid';
      }

    }
    else if ($scope.paymentType.payment_type == 'permata'){
      if ($scope.form.shippingForm.$valid){
        console.log("Permata Success");
      }
      else {

      }
    }

  }

});

paymentApp.directive('expDate', function() {
  return{
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.expDate = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(viewValue)) {
          return true;
        }
        else{
          var date = viewValue.split("/");
          var currentDate = new Date();
          if (viewValue.length == 5) {
            //Format date mm/yy
            var str = '20';
            date[1] = str.concat(date[1]);
          }

          if (currentDate.getFullYear() == date[1]){
            if (date[0] >= currentDate.getMonth() && date[0] <= 12){
              return true;
            }
            else {
              return false;
            }            
          }
          else if (date[1] > currentDate.getFullYear()){
            if (date[0] >= 1 && date[0] <= 12){
              return true;
            }
            else{
              return false;
            }
          }
          else{
            return false;
          }
        }
      }
    }

  }
});

paymentApp.directive('iframeOnload', [function(){
return {
    scope: {
        callBack: '&iframeOnload'
    },
    link: function(scope, element, attrs){
        element.on('load', function(){
            return scope.callBack();
        })
    }
}}])

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