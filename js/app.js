// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
// (function () {
    var users = [];
    var media;
    /* --------------------------------- Event Registration -------------------------------- */
    $('.help-btn').on('click', function() {
        getLocation();
    });
    getLocation();
    /* ---------------------------------- Local Functions ---------------------------------- */
    function findByName() {
        service.findByName($('.search-key').val()).done(function (employees) {
            var l = employees.length;
            var e;
            $('.employee-list').empty();
            for (var i = 0; i < l; i++) {
                e = employees[i];
                $('.employee-list').append('<li><a href="#employees/' + e.id + '">' + e.firstName + ' ' + e.lastName + '</a></li>');
            }
        });
    }

    function getLocation() {
      alert("inside get");
      var locOptions = {
          timeout : 5000,
          enableHighAccuracy : true
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

        var cityName = "";
        // get city using openmaps
        $.getJSON("http://nominatim.openstreetmap.org/reverse?format=json&lat="+ latitude + "&lon=" + longitude, function(data) {
          cityName = data["address"]["city"];
          $(".location").text(cityName);
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
      alert(user["id"])
      // get the track from users
      $.getJSON("https://api.soundcloud.com/users/"+user["id"]+"/tracks.json?client_id=e9ee28603fa8faabe2fcbd7b19a1e700", function(data) {
        tracks = data;

        console.log(tracks);
        // get a random track and start playing it
        track = tracks[Math.floor(Math.random()*tracks.length)];
        console.log(track);
        console.log(track["stream_url"]);
        console.log(track["stream_url"] + "?client_id=e9ee28603fa8faabe2fcbd7b19a1e700");
        media = new Media(track["stream_url"] + "?client_id=e9ee28603fa8faabe2fcbd7b19a1e700");
        media.play();

        // update song and artist
        $(".song-title").text(track["title"]);
        $(".artist-name").text(track["user"]["username"]);

        artwork_url = ""
        if (track["artwork_url"]) {
          artwork_url = track["artwork_url"]  
        }
        else {
          artwork_url = track["avatar_url"]
        }

        // update album image to use 400x400 image
        artwork_url = artwork_url.replace("large", "crop")
        $(".album-art").attr("src", artwork_url);
        
      });
    }

    function nextSong() {
      media.stop();
      getLocation();
    }
// });