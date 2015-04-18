app.factory("SmackFactory", function($http, $rootScope) {

  var findAllSmacktalks = function (callback) {
    $http.get('/rest/smacktalk')
    .success(function (smacktalks) {
      $rootScope.smacktalks = smacktalks;
    });
  }

  var createSmacktalk = function (smackPost) {
    $http.post('/rest/smacktalk', smackPost)
    .success(function(smacktalks) {
      $rootScope.smacktalks = smacktalks;
      console.log($rootScope.smacktalks);
    });
  }

  var editSmackTalk = function (callback) {
    $http.put('/rest/smacktalk')
    .success(callback);
  }

  var deleteSmackTalk = function (callback) {
    $http.delete('/rest/smacktalk')
    .success(callback);
  }

  return {
    findAllSmacktalks: findAllSmacktalks,
    createSmacktalk: createSmacktalk,
    editSmackTalk: editSmackTalk,
    deleteSmackTalk: deleteSmackTalk
  };
});

app.controller("SmacktalkController", function ($scope, $modal, $http, $log, SmackFactory) {
    /*$http.get('/rest/smacktalk')
    .success(function (response) {
      $scope.smacktalks = response;
    });
*/
    SmackFactory.findAllSmacktalks();

/*
    $scope.createSmack = function(smackPost) {
      smackPost.author = currentUser;
      console.log(smackPost);
      $http.post('/rest/smacktalk', smackPost)
      .success(function (response) {
        $scope.smacktalks = response;
        console.log(response);
      });
    }
*/
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

angular.module('ui.bootstrap').controller('ModalInstanceCtrl', function ($scope, $modalInstance, $http, SmackFactory) {
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

    SmackFactory.createSmacktalk(smackPost);

    SmackFactory.findAllSmacktalks();
      /*$http.post('/rest/smacktalk', smackPost)
      .success(function (response) {
        $scope.smacktalks = response;
        console.log($scope.smacktalks);
      });*/
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});