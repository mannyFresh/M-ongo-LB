app.controller("NavCtrl", function($scope, $http, $location, $rootScope){
   $scope.logout = function(){
       $http.post("/logout")
       .success(function(){
           $rootScope.currentUser = null;
           $location.url("/home");
       });
   }

    $scope.getPlayers = function() {
    	$http.get('/rest/player')
	    .success(function (response) {
	      $scope.retrievedPlayers = response;
	    });
    }

   $scope.selectedPlayer = null;
  
  // instantiate the bloodhound suggestion engine
  var players = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.num); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: [
      { num: 'one' },
      { num: 'two' },
      { num: 'three' },
      { num: 'four' },
      { num: 'five' },
      { num: 'six' },
      { num: 'seven' },
      { num: 'eight' },
      { num: 'nine' },
      { num: 'ten' }
    ]
  });
   
  // initialize the bloodhound suggestion engine
  players.initialize();
  
  $scope.playersDataset = {
    displayKey: 'num',
    source: players.ttAdapter()
  };
  
  $scope.addValue = function () {
    players.add({
      num: 'twenty'
    });
  };
  
  $scope.setValue = function () {
    $scope.selectedPlayer = { num: 'seven' };
  };
  
  $scope.clearValue = function () {
    $scope.selectedPlayer = null;
  };

  
  // Typeahead options object
  $scope.exampleOptions = {
    highlight: true
  };
  
  $scope.exampleOptionsNonEditable = {
    highlight: true,
    editable: false // the new feature
  }; 
});