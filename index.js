$(document).ready(function() {
	initialize();
    if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(codeAddress);
	} else { 
        $("#city").html("Geolocation is not supported by this browser.");
    }
});

var actMeasure = "F";
var actTempC = 0;
var actTempF = 0;

$(document).on("click", "#measure", function() {
	if (actMeasure == "C") {
		$("#actM").html("Celsius " + actTempC);
		actMeasure = "F";
	} else {
		$("#actM").html("Fahrenheit " + actTempF);
		actMeasure = "C";
	}
});

function unixToTime(unixIn) {
	var date = new Date(unixIn*1000);
	return date.getHours() + ':' + ("0" + date.getMinutes()).substr(-2) + ':' + ("0" + date.getSeconds()).substr(-2);
}

var geocoder;
var map;
function initialize() {
	var latlng = new google.maps.LatLng(-34.397, 150.644);
	var mapOptions = {
		zoom: 8,
		center: latlng
	}
	map = new google.maps.Map(document.getElementById("map"), mapOptions);
	geocoder = new google.maps.Geocoder();
}

function codeAddress(position) {
	$("#actLatitude").html(position.coords.latitude);
	$("#actLongitude").html(position.coords.longitude);
	var latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
	geocoder.geocode({'location': latlng} , function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});
			if (results[0].geometry.viewport) 
				map.fitBounds(results[0].geometry.viewport);
			
			var addressComponents = results[0].address_components;
			for(i=0;i<addressComponents.length;i++){
				var types = addressComponents[i].types
				if(types=="locality,political"){
					$("#currentCity").html(addressComponents[i].long_name);
					$("#localCity").html(results[0].formatted_address);
					$.getJSON("http://api.openweathermap.org/data/2.5/weather?q="+addressComponents[i].long_name+"&APPID=061f24cf3cde2f60644a8240302983f2",function(json) {
						//$("#localWeather").html(JSON.stringify(json));
						var convKelvinToCelsius = (json.main.temp - 273).toFixed(2);
						var convKelvinToFahrenheit = (json.main.temp * (9/5) - 459.67).toFixed(2);
						$("#sunRiseTime").html(unixToTime(json.sys.sunrise));
						$("#sunSetTime").html(unixToTime(json.sys.sunset));
						$("#actualTempC").html(convKelvinToCelsius.toString());
						$("#actualTempF").html(convKelvinToFahrenheit.toString());
						actTempC = convKelvinToCelsius.toString();
						actTempF = convKelvinToFahrenheit.toString()
						$("#actM").html("Celsius " + actTempC);
						$("#actWeatherIco").attr("src", "http://openweathermap.org/img/w/"+json.weather[0].icon+".png");
						$("#actWeatherIco").attr("alt", json.weather[0].description);
					});
				}
			}
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}