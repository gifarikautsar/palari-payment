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
        ctrl.$validators.phonenumber = function(modelValue, viewValue) {
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

formApp.directive('cardNumber', function(creditCardService){
  return{
    restrict: "E",
    templateUrl: "../app/shared/form/card-number.html",
    scope: {
      ngModel: '=',
    },
    link: function(scope, element, attrs) {
      scope.status = 'default';

      scope.$watch('ngModel', function(val){
        console.log(scope.status);
        if (val != undefined){
          var cardType = creditCardService.numberValidation(val).cardType;
          var valid = creditCardService.numberValidation(val).valid;
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

formApp.directive('expDate', function() {
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

formApp.directive('iframeOnload', [function(){
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

formApp.directive('select', function($interpolate) {
  return {
    restrict: 'E',
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      var defaultOptionTemplate;
      scope.defaultOptionText = attrs.defaultOption || 'Select...';
      defaultOptionTemplate = '<option value="" disabled selected style="display: none;">{{defaultOptionText}}</option>';
      elem.prepend($interpolate(defaultOptionTemplate)(scope));
    }
  };
});

formApp.directive('number', function() {
  return {
    restrict: "E",
    templateUrl: "../app/shared/form/number.html",
    scope: {
      ngModel: '=',
      max: '@'
    },
    link: function(scope, element, attrs, ctrl) {
      scope.ngModel = 1;
     
      scope.minus = function() {
        if (scope.ngModel > 1) {
          scope.ngModel = scope.ngModel - 1;
        }
      }

      scope.plus = function() {
        if (scope.ngModel < parseInt(scope.max)){
          scope.ngModel = scope.ngModel + 1;
        }
      }

      scope.$watch('ngModel', function(newValue, oldValue){
        if (scope.ngModel < 1) {
          scope.ngModel = 1;
        }
        else if (scope.ngModel > parseInt(scope.max)) {
          scope.ngModel = parseInt(scope.max);
        }
        else if (isNaN(scope.ngModel)) {
          scope.ngModel = oldValue;
        }
      })

    }
  }
})

