app.controller("TeamController", function($scope, $http, $routeParams) {
    $http.get('/rest/team')
    .success(function (response) {
      $scope.teams = response;
    });

    $http.get('/rest/team/' + $routeParams.franchID)
    .success(function (response) {
      $scope.teamDetails = response;
    });

    $scope.getTeam = function(teamName) {
      $scope.teamDetailName = teamName;
    }

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
});