app.factory('ProfileFactory', function ($http, $rootScope) {
    var getAllUsers = function () {
        $http.get("/rest/user")
        .success(function(users) {
            $rootScope.users = users;
        });
    }

    var getUserProfile = function (username) {
        $http.get("/rest/user/" + username)
        .success(function(user)
        {
            $rootScope.userProfile = user[0];
        });
    }

    var unfollowUser = function (currentUserName, user, callback) {
        $http.delete("/rest/user/" + currentUserName + "/" + user)
        .success(callback);
    }

    var followUser = function (currentUserName, user, callback) {
        $http.put("/rest/user/" + currentusername + "/" + user)
        .success(callback);
    }


    ////// THIS ARE METHODS FOR ADMIN USERS

    var removeProfile = function (userID, callback) {
        $http.delete('/rest/user/' + userID)
        .success(callback);
    }

    var updateProfile = function (userID, user, callback) {
        $http.put('/rest/user/' + userID, user)
        .success(callback)
    }

    var addProfile = function (user, callback) {
        $http.post('/rest/user', user)
        .success(callback);
    }

    return {
        getAllUsers: getAllUsers,
        getUserProfile: getUserProfile,
        unfollowUser: unfollowUser,
        followUser: followUser,
        removeProfile: removeProfile,
        updateProfile: updateProfile,
        addProfile: addProfile
    };
});

app.controller('ProfileCtrl', function ($scope, ProfileFactory) {
    
    ProfileFactory.getAllUsers();
    
    $scope.remove = function(user)
    {
        ProfileFactory.removeProfile(user._id, function (users) {
            $scope.users = users;
        });

    }
    
    $scope.update = function(user)
    {
        ProfileFactory.updateProfile(user._id, user, function (users) {
            $scope.users = users;
            toastr.success("profile updated!");
        });
    }
    
    $scope.add = function(user)
    {
        ProfileFactory.addProfile(user, function(users){
            $scope.users = users; 
        });
    }
    
    $scope.select = function(user)
    {
        $scope.user = user;
    }
});

app.controller('ProfileDetailController', function ($scope, $http, $routeParams, ProfileFactory) {

    ProfileFactory.getUserProfile($routeParams.username);


    $scope.editFollowing = function(currentUser, username, isFollowing) {

        currentusername = currentUser.username

        if (isFollowing) {

            ProfileFactory.unfollowUser(currentusername, username, function (userObjects) {
                $scope.currentUser = userObjects.currentUserObject;
                $scope.userProfile = userObjects.userProfile;
                toastr.success(username + ' unfollowed!');
            });
        }

        else {

            ProfileFactory.followUser(currentusername, username, function (userObjects) {
                $scope.currentUser = userObjects.currentUserObject;
                $scope.userProfile = userObjects.userProfile;
                toastr.success(username + ' followed!');
            });
        }
    }
});