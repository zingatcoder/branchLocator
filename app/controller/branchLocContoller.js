/*created module*/
var app = angular.module('branchLocator', []);

/*Created constant provider*/
app.constant('baseUrl', 'localhost:8080');

/*Created value provider*/
app.value('appTitle', 'Branch Locator');

/*Created factory provider*/
app.factory('sampleFactory', function () {
    return {
      title: 'Sample Factory'
    }
});

/*Created the Decorator*/
/* app.decorator('appTitle', function ($delegate) {
    return $delegate + ' - modified here';
  });*/

/*Create Provider*/
app.provider('sampleProvider', function () {
  var version;
  return {
    setVersion: function (value) {
      version = value;
    },
    $get: function () {
      return {
          title: 'The sample application'
      }
    }
  }
});


/*created controller*/
app.controller('branchCtrl', ['$http', '$filter', 'getJson', 'baseUrl', 'appTitle', 'sampleFactory', 'sampleProvider', function ($http, $filter, getJson, baseUrl, appTitle, sampleFactory, sampleProvider) {
    var vm = this;
    vm.search = {};
    vm.stDesc = undefined;
    vm.clickVal = true;
    vm.currentCT = [];
    vm.filteredBranches = null;
    
    /*Constant used*/
    console.log('Constant baseurl   '+baseUrl);

    /*Value is used*/
    console.log('Provider Value Title '+appTitle);
    
    /*factory used*/
    var tempTitle = sampleFactory.title;
    console.log('Factory used'+tempTitle);
    
    /*Provider used*/
    console.log('Provider used'+sampleProvider.title);
    
    
    vm.currentCities = function (ctName) {
        vm.currentCT.push(ctName);
    }
    getJson.getBranches(function(data){
        vm.branches = data;
        vm.filteredBranches = vm.branches;
    });
   debugger;
    getJson.getStates(function (data) {
        vm.states = data;
        console.log(vm.states);
    });

    getJson.getCities(function (data) {
        vm.cities = data;
    });

    vm.getCity = function (ctCode) {
        return vm.cities?$filter('filter')($filter('filter')(vm.cities, vm.search.stCode)[0].cityList, ctCode)[0].ctDesc:'';
    }

    vm.getSTCode = function () {
        vm.ctDesc=null;
        vm.stTemp = $filter('filter')(vm.states, vm.Name, true);
        vm.search.stCode = vm.Name ? (vm.stTemp.length == 0 ? vm.Name : vm.stTemp) : undefined;
    }
    vm.getCTCode = function () {
        vm.tmp = $filter('filter')(vm.cities, { stCode: vm.search.stCode });
        vm.cityList = {};
        vm.cityList.ctDesc = vm.ctDesc;
        vm.search.ctCode = vm.ctDesc ? $filter('filter')(($filter('filter')(vm.tmp, vm.cityList.ctDesc)[0].cityList),vm.ctDesc)[0].ctCode : undefined;
    }
   
    vm.applyFilters = function () {
        vm.filteredBranches = $filter('filter')(vm.branches, vm.search);
        getJson.cityArr = [];
        var ftCity = [];
        angular.forEach(vm.filteredBranches, function (branch) {
            var ftCityName = $filter('filter')(vm.cities, { stCode: branch.stCode });
            angular.forEach(ftCityName, function (city, index) {
                angular.forEach(city.cityList, function (ct, index) {
                    ftCity = $filter('filter')(city.cityList, branch.ctCode);
                })            })
            angular.forEach(ftCity, function (fCt) {
                getJson.cityArr.push(fCt.ctDesc);
            });
           
        })
        console.log(getJson.cityArr);
    }
}]);

/*created service*/
app.service('getJson', ['$http', function ($http) {

    var vm = this;
    vm.search = {};
    
    vm.getBranches = function (callback) {
        $http({
            method: 'GET',
            url: '../json/branches.json'
        }).then(function successCallback(response) {
            callback(JSON.parse(JSON.stringify(response.data)).Branch);
        }, function errorCallback(response) {
            //Error
        });
    }

    vm.getStates = function (callback) {
        $http({
            method: 'GET',
            url: 'https://www.whizapi.com/api/v2/util/ui/in/indian-states-list?project-app-key=x1hg5xstp43pcqoqo4z4auh1'
        }).then(function successCallback(response) {
           
            callback(JSON.parse(JSON.stringify(response.data)).Data);
        }, function errorCallback(response) {
            //Error
        });
    }

    vm.getCities = function (callback) {
        $http({
            method: 'GET',
            url: '../json/city.json'
        }).then(function successCallback(response) {
            callback(JSON.parse(JSON.stringify(response.data)).city);
        }, function errorCallback(response) {
            //Error
        });
    }
}]);


app.controller('MapCtrl', function (getJson) {
    var vm = this;
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(40.0000, -98.0000),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    var infoWindow = new google.maps.InfoWindow();

    var myLatLng = { lat: 18.5204, lng: 73 };

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: myLatLng
    });

    var geocoder;
    geocoder = new google.maps.Geocoder();
    angular.forEach(getJson.cityArr, function(city,i){
        geocoder.geocode({ 'address': city }, function (results, status) {
            if (status == 'OK') {
                map.setCenter(results[0].geometry.location);
                vm.marker = new google.maps.Marker({
                    map: map,
                    title: city,
                    label: city,
                    position: results[0].geometry.location
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    })
});