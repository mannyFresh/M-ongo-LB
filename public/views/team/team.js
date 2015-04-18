app.controller("TeamController", function($scope, $http, $routeParams) {

    $http.get('/rest/team')
    .success(function (response) {
      $scope.teams = response;
    });

    $http.get('/rest/team/' + $routeParams.franchID)
    .success(function (response) {
      $scope.teamDetails = response;
    });

    $scope.isFav = function(currentUser, teamID) {
      if (currentUser.teams.indexOf(teamID) != -1) {
        var isActive = true;
        return isActive;
      }
    }

    $scope.editFav = function(currentUser, franchID) {
      //$http.put('rest/user/')
      //console.log(currentUser);
      /*
      var newTeam = {
        franchID: franchID,
        teamName: franchName
      }
*/
      //currentUser.teams.push(newTeam);

      if (currentUser.teams.indexOf(franchID) > -1) {
        $http.delete('/rest/user/' + currentUser._id + '/team/' + franchID)
        .success(function(response) {
          //$scope.users = users;
          $scope.users = response;
          $scope.currentUser = response;
          console.log(response);
          toastr.success('team unfavorited!');
        });
      }
      
      else {
        $http.put('/rest/user/' + currentUser._id + '/team/' + franchID)
        .success(function(response){
            $scope.users = response;
            $scope.currentUser = response;
            console.log(response);
            toastr.success('team favorited!');
        });
      }
    }

});