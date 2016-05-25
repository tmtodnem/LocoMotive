app.service('data_service', function($http) 
{
  delete $http.defaults.headers.common['X-Requested-With'];

  // get route data with <origin> <dest> with search date <dateString>
  this.get_routes_from_to_on = function(origin, dest, dateString)
  {
      return $http(
      {
          method: 'GET',
          //url: 'http://localhost:8000/trainsched/routes_from_to_on/' + origin + '/' + dest + '/' + dateString
          url: 'http://54.165.156.225/trainsched/routes_from_to_on/' + origin + '/' + dest + '/' + dateString
       });
  }

  // get route data 
  this.get_live_data = function(train_number, arrival_time)
  {
    console.log(train_number);
    // $http() returns a $promise that we can add handlers with .then()
    return $http(
    {
        method: 'GET',
        //url: 'http://localhost:8000/trainsched/live_data_get/' + train_number + '/' + arrival_time
        url: 'http://184.72.105.126/trainsched/live_data_get/' + train_number + '/' + arrival_time
    });
  }
});