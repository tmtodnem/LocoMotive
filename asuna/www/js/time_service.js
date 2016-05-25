// THIS IS A TIME SERVICE; IT CONTAINS TIME FUNCTIONS THAT ARE USED ACROSS APPLICATION

app.service('time_service', function($http) 
{
  // extract date from <date_obj> as a string YYYY-MM-DD
  this.get_date_string = function (date_obj)
  {
    var m = date_obj.getMonth() + 1;
    var d = date_obj.getDate();
    var y = date_obj.getFullYear();
    if (d < 10)
      d = '0' + d
    if (m < 10)
      m = '0' + m
    return y + '-' + m + '-' + d
  }

  // get month name from date object
  this.get_month_name = function(date_obj)
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[date_obj.getMonth()];
  }

  // get day as a 2 digit number from date object
  this.get_day_string = function(date_obj)
  {
    var day = date_obj.getDate();
    if (day < 10)
      day = '0' + day
    return day
  }

  // get month as a 2 digit number from date object
  this.get_month_string = function(date_obj)
  {
    var month = date_obj.getMonth() + 1;
    if (month < 10)
      month = '0' + month
    return month
  }

  // convert a military time string to standard time string
  // code borrowed from the following URL:
  // http://grephaxs.com/convert-military-time-to-standard-time-with-javascript/
  this.mil_to_standard = function(value) 
  {
    if (value !== null && value !== undefined){ //If value is passed in
      if(value.indexOf('AM') > -1 || value.indexOf('PM') > -1){ //If time is already in standard time then don't format.
        return value;
      }
      else 
      {
        if(value.length == 8)
        { //If value is the expected length for military time then process to standard time.
          var hour = value.substring ( 0,2 ); //Extract hour
          var minutes = value.substring ( 3,5 ); //Extract minutes
          var identifier = 'AM'; //Initialize AM PM identifier
   
          if(hour == 12){ //If hour is 12 then should set AM PM identifier to PM
            identifier = 'PM';
          }
          if(hour == 0){ //If hour is 0 then set to 12 for standard time 12 AM
            hour=12;
          }
          if(hour > 12){ //If hour is greater than 12 then convert to standard 12 hour format and set the AM PM identifier to PM
            hour = hour - 12;
            identifier='PM';
          }
          hour = String(hour)
          if ((hour.length == 2) && hour.charAt(0) == '0')
          {
            hour = hour.charAt(1);
          }
          return hour + ':' + minutes + ' ' + identifier; //Return the constructed standard time
        }
        else 
        { //If value is not the expected length than just return the value as is
          return value;
        }
      }
    }
  };

  // extract the military time as a string from the date object: HH:MM:SS
  this.extract_time_from_obj = function(date_obj, military)
  {
    var hour    = date_obj.getHours();
    var minute  = date_obj.getMinutes();
    var second  = date_obj.getSeconds(); 
   
    if (hour.toString().length == 1) 
    {
        var hour = '0' + hour;
    }
    if (minute.toString().length == 1) 
    {
        var minute = '0' + minute;
    }
    if (second.toString().length == 1) 
    {
        var second = '0' + second;
    }
    var time = hour + ':' + minute + ':' + second;
    if (military)
    {
      return time;
    }
    return this.mil_to_standard(time)
  }

  // remove seconds military time string: HH:MM:SS --> HH:MM
  this.mil_remove_seconds = function(value)
  {
    if (value.length == 8)
    {
      return value.substring(0, 5)
    }
    else
    {
      return value;
    }
  }

  // convert minutes to hours
  this.min_to_hours = function(time) 
  {
    var hours = Math.floor(time / 60);
    var minutes = time % 60;

    var abbrev = "";
    if (hours == 1)
      abbrev = "1 hr ";
    if (hours > 1)
      abbrev = hours.toString().concat(" hrs ");

    var abbrev_1 = "";
    if (minutes > 0)
      abbrev_1 = minutes.toString().concat(" min");

    var final = abbrev.concat(abbrev_1);
    return final;
  }

  // is <time> a properly formatted string? 
  this.is_time_string = function(time)
  {
    if (typeof time === 'string' || time instanceof String)
    {
      if (time.length == 7)
      {
        if (time.charAt(1) == ":")
        {
          if (!isNaN(parseInt(time.charAt(0))))
          {
            if (((!isNaN(parseInt(time.substring(2,4)))) && (parseInt(time.substring(2,4)) >= 0)) && (parseInt(time.substring(2,4)) < 60))
            {
              if ((time.charAt(4) == " ") && ((time.substring(5,7) == "AM") || (time.substring(5,7) == "PM")))
                return true;
            }
          }
        }
      }
      else if (time.length == 8)
      {
        if (time.charAt(2) == ":")
        {
          if ((!isNaN(parseInt(time.substring(0,2)))) && ((parseInt(time.substring(0,2)) > 0) && (parseInt(time.substring(0,2)) < 13)))
          {
            if (((!isNaN(parseInt(time.substring(3,5)))) && (parseInt(time.substring(3,5)) >= 0)) && (parseInt(time.substring(3,5)) < 60))
            {
              if ((time.charAt(5) == " ") && ((time.substring(6,8) == "AM") || (time.substring(6,8) == "PM")))
                return true;
            }
          }
        }
      }
    }
    return false;
  }

  // are <d1> and <d2> on the same day?
  this.is_same_day = function(d1, d2)
  {
    var y1 = d1.getFullYear();
    var y2 = d2.getFullYear();
    var m1 = d1.getMonth();
    var m2 = d2.getMonth();
    var date1 = d1.getDate();
    var date2 = d2.getDate();
    if (y1 != y2)
    {
      console.log("year");
      console.log(y1 + ', ' + y2);
      return false;
    }
    else if (m1 != m2)
    {
      console.log("month");
      console.log(m1 + ', ' + m2);
      return false;
    }
    else if (date1 != date2)
    {
      console.log("date")
      console.log(date1 + ', ' + date2);
      return false;
    }
    return true;
  }

});