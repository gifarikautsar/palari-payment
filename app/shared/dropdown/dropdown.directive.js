var dropdownApp = angular.module('dropdownApp', []);

dropdownApp.run(function($rootScope) {
  angular.element(document).on("click", function(e) {
    $rootScope.$broadcast("documentClicked", angular.element(e.target));
  });
});

dropdownApp.directive("dropdown", function($rootScope, $timeout) {
  return {
    restrict: "E",
    templateUrl: "../app/shared/dropdown/dropdown.html",
    require: '^ngModel',
    scope: {
      placeholder: "@",
      list: "=",
      selected: "=",
      property: "@",
      ngChange: '&'
    },
    link: function(scope, element, attrs) {
      scope.listVisible = false;
      scope.isPlaceholder = true;

      scope.select = function(item) {
        scope.isPlaceholder = false;
        scope.selected = item;
        scope.listVisible = false;
        scope.ngModel = item;
        $timeout(scope.ngChange, 0);
      };

      scope.isSelected = function(item) {
        return item[scope.property] === scope.selected[scope.property];
      };

      scope.show = function() {
        scope.listVisible = true;
      };

      // $rootScope.$on("documentClicked", function(inner, target) {
      //   console.log($(target[0]).is(".dropdown-display.clicked") || $(target[0]).parents(".dropdown-display.clicked").length > 0);
      //   if (!$(target[0]).is(".dropdown-display.clicked") && !$(target[0]).parents(".dropdown-display.clicked").length > 0)
      //     scope.$apply(function() {
      //       scope.listVisible = false;
      //     });
      // });

      // scope.$watch("listVisible", function(value){
      //   console.log("list Visible:" + scope.listVisible);
      // });

      scope.$watch("selected", function(value) {
        scope.isPlaceholder = scope.selected[scope.property] === undefined;
        scope.display = scope.selected;
      });
    }
  }
});