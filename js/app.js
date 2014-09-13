// We use an "Immediate Function" to initialize the application to avoid leaving anything behind in the global scope
// (function () {
    users = [];
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
        users = data;
        user = users[Math.floor(Math.random()*users.length)];
        getRandomTrack(user);
      });
    }

    function getRandomTrack(user) {
      alert(user["id"])
      // get the track from users
      $.getJSON("https://api.soundcloud.com/users/"+user["id"]+"/tracks.json?client_id=e9ee28603fa8faabe2fcbd7b19a1e700", function(data) {
        tracks = data;

        // get a random track and start playing it
        track = tracks[Math.floor(Math.random()*tracks.length)];
        console.log(track);
        console.log(track["stream_url"]);
        console.log(track["stream_url"] + "?client_id=e9ee28603fa8faabe2fcbd7b19a1e700");
        var media = new Media(track["stream_url"] + "?client_id=e9ee28603fa8faabe2fcbd7b19a1e700");
        media.play();
      });
    }
// });