// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
// (function () {
    var users = [];
    var media;
    var play = true;
    var count = 0;
    var cityName = "";
    var positionLast = null;
    /* --------------------------------- Event Registration -------------------------------- */
    getLocation();
    /* ---------------------------------- Local Functions ---------------------------------- */
    function getLocation() {
        
      // !!!!FIRST ALERT!!!! alert("inside get");
        
      var locOptions = {
          timeout : 5000,
          enableHighAccuracy : false
      };

      // get the current position
      navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, locOptions);
    }
    function onLocationSuccess(loc) {
        //We received something from the API, so first get the
        // timestamp in a date object so we can work with it
        //Then replace the page's content with the current
        // location retrieved from the API
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;

        // get city using openmaps
        $.getJSON("http://nominatim.openstreetmap.org/reverse?format=json&lat="+ latitude + "&lon=" + longitude, function(data) {
          cityName = data["address"]["city"];
          getSoundCloudInfo(cityName);
        });
      }

    function onLocationError(e) {
      alert("Geolocation error: #" + e.code + "\n" + e.message);
    }

    function getSoundCloudInfo(cityName) {
      // encode city
      city = encodeURI(cityName);

      $.getJSON("https://api.soundcloud.com/users.json?client_id=e9ee28603fa8faabe2fcbd7b19a1e700&limit=50&q=" + cityName, function(data) {
        // find a user that actually has tracks, and push that user to list of users
        $.each(data, function(index, value) {
          if (value["track_count"] > 0) {
            users.push(value);
          }
        });
        user = users[Math.floor(Math.random()*users.length)];
        getRandomTrack(user);
      });
    }

    function getRandomTrack(user) {
        
      // !!!!SECOND ALERT!!!! alert(user["id"])
        
      // get the track from users
      $.getJSON("https://api.soundcloud.com/users/"+user["id"]+"/tracks.json?client_id=e9ee28603fa8faabe2fcbd7b19a1e700", function(data) {
        tracks = data;

        // get a random track and start playing it
        track = tracks[Math.floor(Math.random()*tracks.length)];
        media = new Media(track["stream_url"] + "?client_id=e9ee28603fa8faabe2fcbd7b19a1e700");
        if ($(".intro").length) {
          $(".intro").remove();
          $("#content").css("display", "inline");
        };
        stopLoad();
        media.play();
        count++;

        mediaTimer = null;
        duration = Number(track["duration"])/1000
      // Update my_media position every second
        if (mediaTimer == null) {
            mediaTimer = setInterval(function() {
                // get my_media position
                media.getCurrentPosition(
                    // success callback
                    function(position) {
                        if (position > -1) {
                            setAudioPosition(position, duration);
                        }

                    },
                    // error callback
                    function(e) {
                        console.log("Error getting pos=" + e);
                    }
                );
            }, 1000);
        }

        // update song and artist, shortening string when appropriate
          
        var trackTitle = track["title"];
        console.log(trackTitle);
        console.log(typeof trackTitle);
        var artistName = track["user"]["username"];
          
        if (trackTitle.length > 27) {
            $(".song-title").text(trackTitle.substring(0,25).concat("..."));
        } else {
            $(".song-title").text(trackTitle);
        }
          
        if (artistName.length > 27) {
            $(".artist-name").text(artistName.substring(0,25).concat("..."));
        } else {
            $(".artist-name").text(artistName);
        }
          
        //update twitter link
        
        //$("#twitter-link").attr("href", "http://twitter.com/home/?status="+"Check%20out%20"+cityName+"%20artist%2C%20"+artistName+"%21%20%23soundscapes%20%23"+cityName);
        //$("#twitter-link").attr("href", "http://twitter.com/home/?status="+escape("Check out "+cityName+" artist, "+artistName+"! #soundscapes #"+cityName));
          $("#twitter-link").attr("href", "http://twitter.com/intent/tweet?text="+escape("Check out "+cityName+" artist, "+artistName+"! #soundscapes #"+cityName+" "+track["permalink_url"]));
          //http://twitter.com/intent/tweet?text=
        
        
        // set path of default artwork here
        artwork_url = "img/default-album.png";
        if (track["artwork_url"]) {
          artwork_url = track["artwork_url"]; 
        }
        else if (track["avatar_url"]) {
          artwork_url = track["avatar_url"];
        }

        // update album image to use 400x400 image
        artwork_url = artwork_url.replace("large", "crop")
        $(".album-art").attr("src", artwork_url);
        
        $(".album-art").css("width", $("body").width()*.9);

        //update album-art height
        var width = $(".album-art").width();

        $(".album-art").css("height", width);
        // $(".progress-bar").css("width", width);
      });
    }

    function nextSong() {
      media.stop();
      startLoad();
      if (count < 3) {
        // get random user
        user = users[Math.floor(Math.random()*users.length)];
        getRandomTrack(user);
        count = 0;
      } else {
        getLocation();
      }
    }

    function setAudioPosition(position, duration) {
      if (position > duration -3) {
        nextSong();
        return;
      }
      position = Number(position);
      var val = ((position/duration) * .9) * 100;
      $(".progress").css("width", val.toString() + "%");
      $(".help-btn").text(position);
      positionLast = position;
    }

    function toggle() {
      if (play) {
        media.pause();
        play = false;
        $(".play").attr("src", "img/play.png")
      } else {
        play = true;
        media.play();
        $(".play").attr("src", "img/pause.png");
      }
    }

    function startLoad() {
      $(".location").text("Loading your next song...");
    }

    function stopLoad() {
      $(".location").text(cityName);
    }

// });