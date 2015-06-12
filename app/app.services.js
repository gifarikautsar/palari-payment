var servicesApp = angular.module('servicesApp', []);

//Service
servicesApp.service('CreditCardService', function(){

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
