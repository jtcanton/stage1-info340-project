$(document).ready(function () {

    $('#search-wrapper').hide();
    $('#map-wrapper').hide();
    $('#results-wrapper').hide();
    $('#about-wrapper').hide();

    $('#home-button').click(function () {
        $('#home-content-wrapper').show()
        $('#map-wrapper').hide();
        $('#search-wrapper').hide();
        $('#about-wrapper').hide();
    });

    $('#map-button').click(function () {
        $('#home-content-wrapper').hide()
        $('#map-wrapper').show();
        $('#search-wrapper').hide();
        $('#about-wrapper').hide();
    });

    $('#search-button').click(function () {
        $('#home-content-wrapper').hide()
        $('#map-wrapper').hide();
        $('#search-wrapper').show();
        $('#about-wrapper').hide();
    });

    $('#about-button').click(function () {
        $('#home-content-wrapper').hide()
        $('#map-wrapper').hide();
        $('#search-wrapper').hide();
        $('#about-wrapper').show();
    });

});


// function myFunction(x) {
//     if (x.matches) { // If media query matches
//       document.getElementsByTagName('nav')[0].classList.remove('fixed-bottom');
//     } else {
//       //document.body.style.backgroundColor = "pink";
//     }
//   }
  
//   var x = window.matchMedia("(max-width: 768px)")
//   myFunction(x) // Call listener function at run time
//   x.addListener(myFunction) // Attach listener function on state changes 


//set up the map
var mymap = L.map('mapid').setView([47.6, -122.33],11);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoianRjYW50b24iLCJhIjoiY2pzNm02dWMxMHJ4dTQzcXBlcTd6NmY0dyJ9.oPXri6lR5wETa28eBQzzDw'
}).addTo(mymap);

let API_ENDPOINT = 'https://data.seattle.gov/resource/bsta-72tn.json';
let neighborhoods = ['Admiral', 'Alki', 'Ballard', 'Beacon Hill', 'Belltown', 'Capitol Hill', 'Central District', 'Chinatown/International District', 'Columbia City', 'Crown Hill', 'Downtown', 'Eastlake', 'Fauntleroy', 'First Hill', 'Fremont', 'Georgetown', 'Green Lake', 'Greenwood', 'Hillman City', 'Interbay', 'International District', 'Lake City', 'Madrona', 'Northgate', 'Pioneer Square', 'Queen Anne', 'Ravenna', 'Seattle Center in Uptown', 'SODO', 'South Lake Union', 'University District', 'Uptown', 'Wallingford', 'West Seattle',];

//loop thru neightbor hoods and put into drop-down menu
for (let j = 0; j < neighborhoods.length; j++) {
    let newOption = document.createElement('option');
    let optionText = document.createTextNode(neighborhoods[j]);
    newOption.appendChild(optionText);
    document.getElementById('exampleFormControlSelect2').appendChild(newOption);
}

//get the data from the API
function getData() {
    fetch(API_ENDPOINT).then(function (response) {
        console.log(response.status);
        return (response);
    }).then(function (resp) {
        let res = resp.json();
        return res;
    }).then(function (data) {
        performFiltering(data);
    })
}

//filter the data set
function performFiltering(res) {
    //make sure the item can be placed on the map
    function hasLocation(obj) {
        if (obj.location != undefined && obj.location != "" && obj.location != null) {
            return obj;
        }
    }
    //filter by genre and neighborhood parameters entered by user
    function genreAndNeighborhood(obj) {
        if (obj.dominant_discipline === document.getElementById('exampleFormControlSelect1').value && obj.neighborhood === document.getElementById('exampleFormControlSelect2').value) {
            return obj;
        }
    }
    let filtRes = res.filter(hasLocation).filter(genreAndNeighborhood);
    populateResults(filtRes);
    renderMap(filtRes);
}

//layer group variable to add to map
let layerGroup = L.layerGroup();

function renderMap(filtRes) {
    //check if markers are on map already and remove if so
    if (jQuery.isEmptyObject(layerGroup._layers) === false) {
        console.log('not empty! whats next??');
        layerGroup.clearLayers();
    }
    //add markers to the map
    for (let i = 0; i < filtRes.length; i++) {
        let coord2 = filtRes[i].location.coordinates[0];
        let coord1 = filtRes[i].location.coordinates[1];
        let marker = L.marker([coord1, coord2]).addTo(layerGroup);
        marker.bindPopup(filtRes[i].name + "<br>" + filtRes[i].phone + "<br>" + filtRes[i].url).openPopup();
    }
    layerGroup.addTo(mymap);
}

// make the search button work
$('#search-bttn').click(function () {
    getData();
    $('#search-wrapper').hide();
    $('#results-wrapper').show();
    var val1 = document.getElementById('exampleFormControlSelect1').value;
});

// count results
let resultCount = 0;

//populate results
function populateResults(data) {
    if(resultCount > 0){
        document.getElementById('results-wrapper').innerHTML = '';
        resultCount = 0;
    }
    for (let i = 0; i < data.length; i++) {
        let el = document.createElement('div');
        el.classList.add('result-div');
        
        // let h2 = document.createElement('h2');
        // h2.textContent = data[i].name;
        // el.appendChild(h2);

        el.innerHTML = "<p>"+data[i].name+"</p><p><a href=\""+data[i].url+"\">Website</a></p><p>Phone: "+data[i].phone+"</p>";

        document.getElementById('results-wrapper').appendChild(el);
        resultCount++;
    }
}