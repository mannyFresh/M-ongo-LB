app.controller("SmacktalkController", function($scope, $modal, $http, $log) {
    $http.get('/rest/smacktalk')
    .success(function (response) {
      $scope.smacktalks = response;
    });



    $scope.createSmack = function(smackPost) {
      smackPost.author = currentUser;
      console.log(smackPost);
      $http.post('/rest/smacktalk', smackPost)
      .success(function (response) {
        $scope.smacktalks = response;
        console.log(response);
      });
    }

    $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
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

    // POST smack

    // DELETE smack

});

angular.module('ui.bootstrap').controller('ModalInstanceCtrl', function ($scope, $modalInstance, $http) {
  /*
  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };*/

  $scope.ok = function (smackPost, currentUser) {
    //$modalInstance.close($scope.selected.item);
    $modalInstance.close();
    smackPost.author = currentUser.username;
    smackPost.date = new Date();
      $http.post('/rest/smacktalk', smackPost)
      .success(function (response) {
        $scope.smacktalks = response;
        //console.log(response);
      });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});