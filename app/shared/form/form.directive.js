var integerRegex = /^\d+$/;
var phoneNumberRegex = /^[0-9]{5,12}$/;
var decimalRegex = /^(?:\d*\.)?\d+$/;
var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
var emailRegex = /^[\w._%+-]+@[a-zA-Z_]+?(\.[a-zA-Z]{2,4}){1,2}$/;

var formApp = angular.module('formApp', []);

formApp.directive('validationType', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      if (attrs.validationType == 'phonenumber'){
        ctrl.$validators.phone_number = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (phoneNumberRegex.test(viewValue)) {
            // it is valid
            return true; 
          }
          // it is invalid
          return false;
        }        
      }
      else if (attrs.validationType == 'integer'){
        ctrl.$validators.integer = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (integerRegex.test(viewValue)) {
            // it is valid
            return true; 
          }
          // it is invalid
          return false;
        }        
      }
      else if (attrs.validationType == 'decimal'){
        ctrl.$validators.decimal = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (decimalRegex.test(viewValue)) {
            // it is valid
            return true; 
          }
          // it is invalid
          return false;
        }        
      }
      else if (attrs.validationType == 'password'){
        ctrl.$validators.password = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (passwordRegex.test(viewValue)) {
            // it is valid
            return true; 
          }
          // it is invalid
          return false;
        }        
      }
      else if (attrs.validationType == 'email'){
        ctrl.$validators.email = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (emailRegex.test(viewValue)) {
            // it is valid
            return true; 
          }
          // it is invalid
          return false;
        }        
      }
    }
  }
});

//Service
formApp.service('CreditCardService', function(){

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


formApp.directive('cardNumber', function(CreditCardService){
  return{
    restrict: "E",
    templateUrl: "../app/shared/form/card-number.html",
    scope: {
      ngModel: '=',
    },
    link: function(scope, element, attrs) {
      scope.status = 'default'

      scope.$watch('creditCard.card_number', function(val){
        if (val != undefined){
          var cardType = CreditCardService.numberValidation(val).cardType;
          var valid = CreditCardService.numberValidation(val).valid;
          if (val.length == 16) {
            if (valid === 'valid'){
              if (cardType === 'Visa'){
                scope.status = 'visa';
              } else if (cardType === 'MasterCard'){
                scope.status = 'mastercard';
              }
              else {
                scope.status = 'invalid';
              }
            } else if (valid === 'not valid'){
              scope.status = 'invalid';
            }      
          } else {
            scope.status = 'default';
          }
        }

      });


    }
  }
});