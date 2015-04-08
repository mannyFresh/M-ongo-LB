app.controller("TeamController", function($scope, $http) {
    $http.get('/rest/team')
    .success(function (response) {
      $scope.teams = response;
    });

    $http.get('/rest/team/:id')
    .success(function (response) {
      $scope.teamDetail = response;
    });

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