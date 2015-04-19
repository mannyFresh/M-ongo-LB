app.factory("SmackFactory", function($http, $rootScope) {

  var findAllSmacktalks = function () {
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

app.controller("SmacktalkController", function ($scope, $modal, $log, SmackFactory) {

    SmackFactory.findAllSmacktalks();

    $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
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

angular.module('ui.bootstrap').controller('ModalInstanceCtrl', function ($scope, $modalInstance, SmackFactory) {

  $scope.ok = function (smackPost, currentUser) {

    $modalInstance.close();
    smackPost.author = currentUser.username;
    smackPost.date = new Date();

    SmackFactory.createSmacktalk(smackPost);

    SmackFactory.findAllSmacktalks();

  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});