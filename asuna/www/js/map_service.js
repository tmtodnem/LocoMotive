app.service('map_service', function() 
{
  this.origin = null;
  this.destination = null;
  this.center = null;

  this.set_origin = function(from)
  {
    this.origin = from;
    return;
  }

  this.get_origin = function()
  {
    return this.origin;
  }

  this.set_destination = function(to)
  {
    this.destination = to;
    return;
  }

  this.get_destination = function()
  {
    return this.destination;
  }

  // function to alter names to locate on gps map
  function fixNames(location)
  {
      var start = "Princeton Station, NJ";
      if (location == "Princeton Junction")
          start = "LV Princeton Junction";
      else if (location == "New York Penn Station")
          start = "Pennsylvania Station";
      else if (location == "Philadelphia 30th Street")
          start = "30th Street Station";
      else if (location == "Trenton Transit Center")
          start = "Trenton Transit Center";
      else if (location == "Newark Airport")
          start = "Amtrak Station - EWR";
      else if (location == "Atlantic City")
          start = "Atlantic City";
      return start;
  }

  // add marker to map
  this.putGPSonMap = function(map)
  {
    var image = 
    {
      //url: 'https://cdn0.iconfinder.com/data/icons/world-issues/500/running_man-64.png',
      url: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-man-32.png',
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(64, 64),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(16, 24)
    };

    var marker = new google.maps.Marker({map: map, icon:image, animation: google.maps.Animation.DROP});
    // Try HTML5 geolocation.
    //bool notSet = True;
    var notSet = true;
    if (navigator.geolocation) 
    {
      navigator.geolocation.watchPosition(function(position) 
      {
        var pos = 
        {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        marker.setPosition(pos);
        if (notSet){

        var findControlDiv = document.createElement('div');
        var findControl = new FindControl(findControlDiv, map, marker);

        findControlDiv.index = 2;
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(findControlDiv);
        notSet = false;
        }
        //infoWindow.setContent('Location found.');
       // map.setCenter(pos);
      }, function() 
      {
        handleLocationError(true, marker, map.getCenter());
      });
    } 
    else 
    {
      // Browser doesn't support Geolocation
      handleLocationError(false, marker, map.getCenter());
    }
    return marker;
  }

  // display route between origin and destination
  this.calculateAndDisplayRoute = function(map, directionsService, directionsDisplay, location1, location2) 
  {
    location1 = fixNames(location1);
    location2 = fixNames(location2);
    directionsService.route({
      origin: location1,
      destination: location2,
      travelMode: google.maps.TravelMode.TRANSIT, 
      transitOptions: { modes: [google.maps.TransitMode.TRAIN] }
    }, 
    function(response, status) 
    {
      if (status === google.maps.DirectionsStatus.OK) 
      {
        directionsDisplay.setDirections(response);
        this.center = map.getCenter();
      } 
      else 
      {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  function CenterControl(context, controlDiv, map, directionsService, directionsDisplay) 
  {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #779';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.5)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Press to recenter the map';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '14px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Reset Map';
    controlUI.appendChild(controlText);

    // Add click event listener
    controlUI.addEventListener('click', function() 
    {
      context.calculateAndDisplayRoute(map, directionsService, directionsDisplay, context.origin, context.destination);
    });

  }

  function FindControl(controlDiv, map, marker) 
  {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #779';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.5)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Press to find my location';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '14px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Find Me';
    controlUI.appendChild(controlText);

    // Add click event listener
    controlUI.addEventListener('click', function() 
    {
      map.setCenter(marker.position);
    });

  }

  // initialize map and add gps
  this.initialize_map = function(directionsService, directionsDisplay) 
  {
    var styledType = new google.maps.StyledMapType([{"elementType":"geometry","stylers":[{"hue":"#ff4400"},{"saturation":-68},{"lightness":-4},{"gamma":0.72}]},{"featureType":"road","elementType":"labels.icon"},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"hue":"#0077ff"},{"gamma":3.1}]},{"featureType":"water","stylers":[{"hue":"#00ccff"},{"gamma":0.44},{"saturation":-33}]},{"featureType":"poi.park","stylers":[{"hue":"#44ff00"},{"saturation":-23}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"hue":"#007fff"},{"gamma":0.77},{"saturation":65},{"lightness":99}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"gamma":0.11},{"weight":5.6},{"saturation":99},{"hue":"#0091ff"},{"lightness":-86}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"lightness":-48},{"hue":"#ff5e00"},{"gamma":1.2},{"saturation":-23}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"saturation":-64},{"hue":"#ff9100"},{"lightness":16},{"gamma":0.47},{"weight":2.7}]}], {name: 'LocoMotive Style'});

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      center: {lat: 40.340166, lng: -74.657889}, 
      mayTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'style'],
        position: google.maps.ControlPosition.LEFT_CENTER
      }
    });

    map.mapTypes.set('style', styledType);
    map.setMapTypeId('style');

    //putGPSonMap(map);
    // Create the DIV to hold the control and call the CenterControl()
    // constructor passing in this DIV.
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(this, centerControlDiv, map, directionsService, directionsDisplay);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

    this.putGPSonMap(map);

    /*
    // style
    var styledType = new google.maps.StyledMapType([{"elementType":"geometry","stylers":[{"hue":"#ff4400"},{"saturation":-68},{"lightness":-4},{"gamma":0.72}]},{"featureType":"road","elementType":"labels.icon"},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"hue":"#0077ff"},{"gamma":3.1}]},{"featureType":"water","stylers":[{"hue":"#00ccff"},{"gamma":0.44},{"saturation":-33}]},{"featureType":"poi.park","stylers":[{"hue":"#44ff00"},{"saturation":-23}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"hue":"#007fff"},{"gamma":0.77},{"saturation":65},{"lightness":99}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"gamma":0.11},{"weight":5.6},{"saturation":99},{"hue":"#0091ff"},{"lightness":-86}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"lightness":-48},{"hue":"#ff5e00"},{"gamma":1.2},{"saturation":-23}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"saturation":-64},{"hue":"#ff9100"},{"lightness":16},{"gamma":0.47},{"weight":2.7}]}], {name: 'LocoMotive Style'});
    map.mapTypes.set('style', styledType);
    map.setMapTypeId('style');
    */
    return map;
  } 


  // reset the GPS if necessary
  function resetGPS(map, marker){
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        marker.setPosition(pos);
        map.setCenter(pos);
      }, function() {
        handleLocationError(true, marker, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, marker, map.getCenter());
    }
  }
});

app.controller('mapCtrl', function($scope, map_service)
{
  $scope.map = null;
  $scope.directionsService = new google.maps.DirectionsService;
  $scope.directionsDisplay = new google.maps.DirectionsRenderer;
  $scope.origin = '';
  $scope.destination = '';

  // return true if route changed
  // else false
  function check_location_changes_and_update()
  {
    // check if changed
    if (map_service.get_origin() != $scope.origin || map_service.get_destination() != $scope.destination)
    {
      // update routes
      $scope.origin = map_service.get_origin();
      $scope.destination = map_service.get_destination();
      return true;
    }
    return false;
  }

  // create google map object
  // called once the first time map state is visited
  $scope.show_map = function()
  {
    // initialize google map object
    $scope.map = map_service.initialize_map($scope.directionsService, $scope.directionsDisplay);
    // add route using current directions
    $scope.directionsDisplay.setMap($scope.map);
    // set origin and destinations
    $scope.origin = map_service.get_origin();
    $scope.destination = map_service.get_destination();
    // draw route
    map_service.calculateAndDisplayRoute($scope.map, $scope.directionsService, $scope.directionsDisplay,
                                         $scope.origin, $scope.destination);
  }

  // whenever this state is visited, update route to current locations
  $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) 
  {
    if (toState.name == "app.map")
    {
      if (check_location_changes_and_update())
      {
        // erase old route
        $scope.directionsDisplay.setDirections({routes: []});
        // display new route
        map_service.calculateAndDisplayRoute($scope.map, $scope.directionsService, $scope.directionsDisplay,
                                             $scope.origin, $scope.destination);
      }
    }
  })
})
