var servicesApp = angular.module('servicesApp', []);

//Service
servicesApp.service('creditCardService', function(){

  this.numberValidation = function (ccnumber) {
    var len = ccnumber.length;
    var cardType, valid;
    mul = 0,
    prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]],
    sum = 0;

    while (len--) {
        sum += prodArr[mul][parseInt(ccnumber.charAt(len), 10)];
        mul ^= 1;
    }

    if (sum % 10 === 0 && sum > 0) {
      valid = "valid"
    } else {
      valid = "not valid"
    }
    ccnumber = ccnumber.toString().replace(/\s+/g, '');

    if(/^5[1-5]/.test(ccnumber)) {
      cardType = "MasterCard";
    }
    else if (/^4/.test(ccnumber)) {
      cardType = "Visa";
    } else {
      cardType = "None";
    }

    return {
      cardType: cardType,
      valid: valid
    }
  }

});

servicesApp.service('shippingService', function($http){
  return {

    getAreaName: function(type, id){
      $http.get(
        //url
        phinisiEndpoint + '/area/' + type + '?id=' + province_id,        
        //config
        {
          headers :{ 'Content-Type': 'application/json','Accept': 'application/json'} ,       
        }
      )
      .success(function(data){
        console.log(data);
        return data;
      })
      .error(function(data){
        return null;      
      });
    },
    getAreaList: function(type, parent){     
      $http.get(
        //url
        phinisiEndpoint + '/area/' + type + '?parent=' + parent,       
        //config
        {
          headers :{ 'Content-Type': 'application/json','Accept': 'application/json'} ,       
        }
      )
      .success(function(data){
        console.log(data);
        return data;
      })
      .error(function(data){
        return null;        
      });
    }

  }
});

servicesApp.service('dataService', function(){
  var productDetails = null;
  var shippingDetails = null;
  var customerDetails = null;
  var creditCard = null;

  return {
    getProductDetails: function () {
      return productDetails;
    },
    setProductDetails: function (value) {
      productDetails = value;
    },
    getShippingDetails: function () {
      return shippingDetails;
    },
    setShippingDetails: function (value) {
      shippingDetails = value;
    },
    getCustomerDetails: function () {
      return customerDetails;
    },
    setCustomerDetails: function (value) {
      customerDetails = value;
    },
    getCreditCard: function () {
      return creditCard;
    },
    setCreditCard: function (value) {
      creditCard = value;
    }

  }
})

