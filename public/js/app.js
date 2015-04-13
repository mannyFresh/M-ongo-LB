
var app = angular.module("PassportApp", ["ngRoute", "smart-table", "ui.bootstrap", "siyfion.sfTypeahead"]);

app.config(function($routeProvider, $httpProvider) {
    $routeProvider
      .when('/home', {
          templateUrl: 'views/home/home.html',
          resolve: {
              loggedin: checkLoggedin
          }
      })
      .when('/profile', {
          templateUrl: 'views/profile/profile.html',
          controller: 'ProfileCtrl',
          resolve: {
              loggedin: checkLoggedin
          }
      })
      .when('/login', {
          templateUrl: 'views/login/login.html',
          controller: 'LoginCtrl'
      })
      .when('/register', {
          templateUrl: 'views/register/register.html',
          controller: 'RegisterCtrl'
      })
      .when('/team', {
        templateUrl: 'views/team/index.html',
        controller: 'TeamController',
        resolve: {
            loggedin: checkLoggedin
        }
      })
      .when('/team/:franchID', {
        templateUrl: 'views/team/detail.html',
        controller: 'TeamController',
        resolve: {
              loggedin: checkLoggedin
          }
      })
      .when('/player', {
        templateUrl: 'views/player/index.html',
        controller: 'PlayerController',
        resolve: {
              loggedin: checkLoggedin
          }
      })
      .when('/player/:playerID', {
        templateUrl: 'views/player/detail.html',
        controller: 'PlayerDetailController',
        resolve: {
              loggedin: checkLoggedin
          }
      })
      .when('/smacktalk', {
        templateUrl: 'views/smacktalk/index.html',
        controller: 'SmacktalkController',
        resolve: {
              loggedin: checkLoggedin
          }
      })
      .otherwise({
          redirectTo: '/home'
      });
});

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope)
{
    var deferred = $q.defer();

    $http.get('/loggedin').success(function(user)
    {
        $rootScope.errorMessage = null;
        // User is Authenticated
        if (user !== '0')
        {
            $rootScope.currentUser = user;
            deferred.resolve();
        }
        // User is Not Authenticated
        else
        {
            $rootScope.errorMessage = 'You need to log in.';
            deferred.reject();
            $location.url('/login');
        }
    });
    
    return deferred.promise;
};

app.controller("NavCtrl", function($scope, $http, $location, $rootScope){
    $scope.logout = function(){
        $http.post("/logout")
        .success(function(){
            $rootScope.currentUser = null;
            $location.url("/home");
        });
    };
/*
    $scope.selectedPlayer = null;

    // instantiate the bloodhound suggestion engine
    var players = new Bloodhound({
      datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.num); },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: "/rest/player"
    });

    // initialize the bloodhound suggestion engine
    players.initialize();
    
    $scope.playersDataset = {
      displayKey: 'play',
      source: players.ttAdapter()
    };
    
    // Typeahead options object
    $scope.exampleOptions = {
      highlight: true
    };
    
    $scope.exampleOptionsNonEditable = {
      highlight: true,
      editable: false // the new feature
    };*/
});