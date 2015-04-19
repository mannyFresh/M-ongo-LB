app.factory("PlayerFactory", function($http, $rootScope) {

  var findAllPlayers = function () {
    $http.get('/rest/player')
    .success(function (players) {
      $rootScope.players = players;
    });
  }

  var findPlayer = function (playerID) {
    $http.get('/rest/player/' + playerID)
    .success(function (player) {
      $rootScope.playerDetails = player;
    });
  }

  var removeFavPlayer = function (currentUserID, playerID, callback) {
    $http.delete('/rest/user/' + currentUserID + '/player/' + playerID)
    .success(callback);
  }

  var addFavPlayer = function (currentUserID, playerID, callback) {
    $http.put('/rest/user/' + currentUserID + '/player/' + playerID)
    .success(callback);
  }

  return {
    findAllPlayers: findAllPlayers,
    findPlayer: findPlayer,
    removeFavPlayer: removeFavPlayer,
    addFavPlayer: addFavPlayer
  };

});

app.controller("PlayerController", function ($scope, $http, PlayerFactory) {
/*
    $http.get('/rest/player')
    .success(function (response) {
      $scope.players = response;
    });
*/
    PlayerFactory.findAllPlayers();

    $scope.editFavPlayer = function(currentUser, playerID) {

      if (currentUser.players.indexOf(playerID) > -1) {
        PlayerFactory.removeFavPlayer(currentUser._id, playerID, function(response) {
          $scope.users = response;
          $scope.currentUser = response;
          toastr.success('player unfavorited!');
        });
      }
      
      else {
        PlayerFactory.addFavPlayer(currentUser._id, playerID, function(response){
            $scope.users = response;
            $scope.currentUser = response;
            toastr.success('player favorited!');
        });
      }
    }

});

app.controller("PlayerDetailController", function($scope, $http, $routeParams, PlayerFactory) {
    
    PlayerFactory.findPlayer($routeParams.playerID);

    $scope.editFavPlayer = function(currentUser, playerID) {

      if (currentUser.players.indexOf(playerID) > -1) {
        PlayerFactory.removeFavPlayer(currentUser._id, playerID, function(response) {
          $scope.users = response;
          $scope.currentUser = response;
          toastr.success('player unfavorited!');
        });
      }
      
      else {
        PlayerFactory.addFavPlayer(currentUser._id, playerID, function(response){
            $scope.users = response;
            $scope.currentUser = response;
            toastr.success('player favorited!');
        });
      }
    }
});