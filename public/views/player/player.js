app.controller("PlayerController", function($scope, $http, $routeParams) {
    $http.get('/rest/player')
    .success(function (response) {
      $scope.players = response;
    });

    $http.get('/rest/player/' + $routeParams.playerID)
    .success(function (response) {
      console.log(response);
      $scope.playerDetails = response[0];
    });

    $http.get('/rest/team/' + $routeParams.franchID)
    .success(function (response) {
      $scope.teamDetails = response;
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