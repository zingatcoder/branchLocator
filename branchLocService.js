var serviceApp = angular.module('ServiceApp', []);
serviceApp.service('mapLocatorService', function ($http) {
    this.mapLocator = function () {
        $http({
            method: 'GET',
            url: '../json/branchLoc.json'
        }).then(function successCallback(response) {
            branchLacData = JSON.parse(JSON.stringify(response.data)).Branch;
            $.each(branchLacData, function (key, data) {
                var latLng = new google.maps.LatLng(data.lat, data.lng);
                // Creating a marker and putting it on the map
                var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    title: data.title
                });
                marker.setMap(map);

            });

        }, function errorCallback(response) {
            //Error
        });
    }
});