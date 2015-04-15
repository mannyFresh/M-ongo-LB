app.controller('ProfileCtrl', function($scope, $http){
    
    $http.get("/rest/user")
    .success(function(users)
    {
        $scope.users = users;
    });
    
    $scope.remove = function(user)
    {
        $http.delete('/rest/user/'+user._id)
        .success(function(users){
           $scope.users = users; 
        });
    }
    
    $scope.update = function(user)
    {
        $http.put('/rest/user/'+user._id, user)
        .success(function(users){
            $scope.users = users; 
        });
    }
    
    $scope.add = function(user)
    {
        $http.post('/rest/user', user)
        .success(function(users){
            $scope.users = users; 
        });
    }
    
    $scope.select = function(user)
    {
        $scope.user = user;
    }
});

app.controller('ProfileDetailController', function($scope, $http, $routeParams) {
    $http.get("/rest/user/" + $routeParams.username)
    .success(function(user)
    {
        $scope.userProfile = user;
        console.log(user);
    });
})