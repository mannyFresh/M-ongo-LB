app.controller("HomeController", function($scope, $modal, $http, $log) {
	    $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'myHomeModalContent.html',
      controller: 'ModalHomeInstanceCtrl',
      size: size,
      /*resolve: {
        items: function () {
          return $scope.items;
        }
      }*/
    });

    modalInstance.result.then(function (selectedItem) {
      //$scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

angular.module('ui.bootstrap').controller('ModalHomeInstanceCtrl', function ($scope, $modalInstance, $http, $location) {
  /*
  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };*/
  $scope.loginOrRegister = function (path) {
    //$modalInstance.close($scope.selected.item);
    $modalInstance.close();
    $location.path(path);
  };

});