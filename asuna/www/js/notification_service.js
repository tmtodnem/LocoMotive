app.service('notification_service', function(data_service, time_service, $cordovaLocalNotification, $ionicPlatform) 
{  
  // helper function to get military time from AM/PM time
  // borrowed from this URL:
  // http://grephaxs.com/convert-military-time-to-standard-time-with-javascript/
  function get_military_time(time)
  {
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM == "PM" && hours < 12) 
      hours = hours+12;
    if (AMPM == "AM" && hours == 12) 
      hours = hours - 12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours<10) 
      sHours = "0" + sHours;
    if (minutes<10) 
      sMinutes = "0" + sMinutes;
    return sHours + ':' + sMinutes;
  }

  // helper function to add <days> days to <date>
  function addDays(date, days) 
  {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // accepts military time and search date
  // returns the date_time for notification to trigger
  function get_date_time(searchDate, time, cushion)
  {
    // add one day if late train
    var cutoff = 3;
    hours = Number(time.substring(0, 2));
    if (hours <= 3)
      searchDate = addDays(searchDate, 1);

    // set hours and minutes
    minutes = Number(time.slice(-2));
    notif_time = searchDate;
    notif_time.setHours(hours)
    notif_time.setMinutes(minutes - cushion)
    return notif_time
  }

  // update a notification <notif> with new live scraped data
  function updateNotification(notif)
  {
    var data = JSON.parse(notif['data']);
    // get information 
    var train_num = data['train_num'];
    var mil_arr_time = data['schedule']['timeEnd'];
    var place = data['stop'];
    // create date from miliseconds
    var date = new Date(data['date_in_miliseconds']);
    var cushion = data['cushion']
    data['update_count']++;

    data_service.get_live_data(train_num, mil_arr_time).then(function(dataResponse)
    {
        // iterate through data to find relevant time
        var stops = dataResponse.data
        for (var i = 0; i < stops.length; i++)
        {
          var stop = stops[i];
          if (stop['location'] == place)
          {
            console.log(stop['location'])
            // validate time before using
            if (!time_service.is_time_string(stop['time']))
            {
              console.log("not updated because invalid time: " + stop['time'])
              return;
            }
            var update_time_m = get_military_time(stop['time']);
            var update_datetime = get_date_time(date, update_time_m, cushion);
            var update_deadline = update_datetime.getTime();


            // edit to data
            data.deadline = update_deadline;
            data.last_updated = time_service.extract_time_from_obj(new Date(), false);

            // make sure still scheduled
            $cordovaLocalNotification.isScheduled(notif.id).then(function(isScheduled) 
            {
              if (isScheduled)
              {
                $cordovaLocalNotification.update(
                {
                  id: notif.id,
                  at: update_datetime,
                  data: data
                });
                console.log(data.last_updated);
                console.log("updated " + train_num + " " + mil_arr_time);
              }
              else
              {
                console.log("not updated because no longer scheduled" + train_num + " " + mil_arr_time);
              }
            });
            break;
          }
        }
      },
      function(dataResponse)
      {
        console.log("ERROR; COULD NOT UPDATE " + train_num);
      });
    return;
  }

  // iterate through all currently set notifications and perform live update
  this.update_all_notifications = function()
  {
    console.log("trying to update... " + new Date());
    console.log("background mode enabled: " + cordova.plugins.backgroundMode.isEnabled());
    $cordovaLocalNotification.getAllScheduled().then(function(all_notifs) 
    { 
      // update each notification
      for (var i = 0; i < all_notifs.length; i++)
      {
        updateNotification(all_notifs[i]);
      }
    });
  }
  
  // helper function: is <value> in array <current_ids>?
  function inIntArray(current_ids, value)
  {
    for (var i = 0; i < current_ids.length; i++)
    {
      if (current_ids[i] == value)
      {
        return true;
      }
    }
    return false;
  }

  // generate a unique ID for a new notification given currently set IDs
  function getID(current_ids)
  {
    var limit = 5;
    for (var i = 0; i < limit; i++)
    {
      if (!inIntArray(current_ids, i))
      {
        return i;
      }
    }
    return -1;
  }

  // use the live scraped data and place/time of requested notification 
  // to schedule a new notification
  this.schedule_notification = function(live_data, place, time, cushion) 
  {
    $cordovaLocalNotification.getScheduledIds().then(function(all_ids) 
    {
      var this_id = getID(all_ids);
      // error check
      if (this_id < 0)
      {
        alert("You can only schedule 5 notifications at most")
        return;
      }

      // date searched + time stop = datetime
      var date = live_data.date;
      var date_in_miliseconds = date.getTime();
      // create cloned date so original not altered
      var time_m = get_military_time(time);
      var notif_datetime = get_date_time(date, time_m, cushion);
      console.log(notif_datetime);
      var deadline = notif_datetime.getTime();
      var last_updated = time_service.extract_time_from_obj(new Date(), false);


      var deadline_no_cushion = new Date(deadline + cushion*60000);
      // current train number
      var current_num = live_data.current_num

      // store data
      var storage = {
                       date_in_miliseconds: date_in_miliseconds,
                       stop: place,
                       train_num: live_data.current_num,
                       schedule: live_data.schedule,
                       cushion: cushion,
                       update_count: 0,
                       last_updated: last_updated,
                       deadline: deadline
                    };
      console.log(JSON.stringify(live_data.schedule));

      var update_count = 0;
      // if on phone...
      if (ionic.Platform.isWebView()) 
      {
        // schedule notification
        $cordovaLocalNotification.schedule(
        {
          id: this_id,
          title: place,
          text: 'Arriving at ' + time_service.extract_time_from_obj(deadline_no_cushion, false),
          at: notif_datetime,
          data: storage
        })
        .then(function (result) 
        {
          console.log(JSON.stringify(storage));
        });
      }
    });
  }
});