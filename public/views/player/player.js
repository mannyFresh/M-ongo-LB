app.controller("PlayerController", function($scope, $http, $routeParams) {
    $http.get('/rest/player')
    .success(function (response) {
      $scope.players = response;
    });
/*
    $http.get('/rest/player/' + $routeParams.playerID)
    .success(function (response) {
      console.log(response);
      $scope.playerDetails = response[0];
    });
*/
    $scope.remove = function(id)
    {
      $http.delete('/rest/team/' + id)
      .success(function (response) {
        $scope.teams = response;
      });
    }

    $scope.add = function(team)
    {
      $http.post('/rest/team', team)
      .success(function (response) {
        $scope.teams = response;
      });
    }

    $scope.editFavPlayer = function(currentUser, playerID) {
      //$http.put('rest/user/')
      //console.log(currentUser);
      /*
      var newTeam = {
        franchID: franchID,
        teamName: franchName
      }
*/
      //currentUser.teams.push(newTeam);

      if (currentUser.players.indexOf(playerID) > -1) {
        $http.delete('/rest/user/' + currentUser._id + '/player/' + playerID)
        .success(function(response) {
          //$scope.users = users;
          $scope.users = response;
          console.log($scope.users);
        });
      }
      
      else {
        $http.put('/rest/user/' + currentUser._id + '/player/' + playerID)
        .success(function(response){
            $scope.users = response;

            console.log($scope.users);
        });
      }
    }
});

app.controller("PlayerDetailController", function($scope, $http, $routeParams) {
    $http.get('/rest/player/' + $routeParams.playerID)
    .success(function (response) {
      console.log(response);
      $scope.playerDetails = response;
    });
});