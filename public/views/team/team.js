app.factory("TeamFactory", function ($http, $rootScope) {

  var findAllTeams = function () {
    $http.get("/rest/team")
    .success(function (teams) {
      $rootScope.teams = teams;
    });
  }

  var findTeam = function (franchID) {
    $http.get('/rest/team/' + franchID)
    .success(function (team) {
      $rootScope.teamDetails = team;
    });
  }

  var removeFavTeam = function (currentUserID, teamID, callback) {
    $http.delete('/rest/user/' + currentUserID + '/team/' + teamID)
    .success(callback);
  }

  var addFavTeam = function (currentUserID, teamID, callback) {
    $http.put('/rest/user/' + currentUserID + '/team/' + teamID)
    .success(callback);
  }

  return {
    findAllTeams: findAllTeams,
    findTeam: findTeam,
    removeFavTeam: removeFavTeam,
    addFavTeam: addFavTeam
  };

});

app.controller("TeamController", function ($scope, $http, $routeParams, TeamFactory) {

    TeamFactory.findAllTeams();

    TeamFactory.findTeam($routeParams.franchID);

    $scope.editFav = function(currentUser, franchID) {

      if (currentUser.teams.indexOf(franchID) != -1) {
        TeamFactory.removeFavTeam(currentUser._id, franchID, function(response) {
          $scope.currentUser = response;
          toastr.success('team unfavorited!');
        });
      }
      
      else {
        TeamFactory.addFavTeam(currentUser._id, franchID, function(response) {
          $scope.currentUser = response;
          toastr.success('team favorited!');
        });
      }
    }

});