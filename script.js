// Constants
const DEBOUNCE_TIME = 500;
const API_KEY = "c15a2537b542a1cd58466686d7335e4c";
var searchTimeoutId;
const loadingIndicator = document.getElementById("loading_indicator");

// Event listener for keyup events on the search box
const searchBox = document.getElementById("search_input");
searchBox.addEventListener("keyup", debounceSearch);

// Function to debounce search input
function debounceSearch(event) {
    const searchPhrase = event.target.value;

    // Check if the input search phrase is long enough to trigger a search
    if (searchPhrase.length >= 3) {
        clearTimeout(searchTimeoutId);
        searchTimeoutId = setTimeout(() => {
            searchLocation(searchPhrase);
        }, DEBOUNCE_TIME);
        loadingIndicator.classList.remove("d-none");
    }

    // Clear search results if the search phrase is empty
    if (searchPhrase.length === 0) {
        const searchResultsList = document.getElementById("search_results");
        searchResultsList.innerHTML = "";
    }
}

// Function to search for locations based on the input search phrase
async function searchLocation(searchPhrase) {
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchPhrase}&limit=5&appid=${API_KEY}`;

    try {
        const response = await fetch(geoApiUrl);
        const locationData = await response.json();
        updateSearchResults(locationData);
        loadingIndicator.classList.add("d-none");
    } catch (error) {
        loadingIndicator.classList.add("d-none");
        console.error("searchLocation() Error:", error);
    }
}

// Function to update the search results feed
function updateSearchResults(locationData) {
    const searchResultsList = document.getElementById("search_results");
    searchResultsList.innerHTML = "";

    for (let i = 0; i < locationData.length; i++) {
        const locationItem = document.createElement("li");
        locationItem.className = "list-group-item results";
        locationItem.setAttribute("lon", locationData[i].lon);
        locationItem.setAttribute("lat", locationData[i].lat);
        locationItem.innerText = locationData[i].name;

        const spanState = document.createElement("span");
        spanState.innerText = `, ${locationData[i].state}`;

        const spanCountry = document.createElement("span");
        spanCountry.innerText = `, ${locationData[i].country}`;

        locationItem.appendChild(spanState);
        locationItem.appendChild(spanCountry);
        searchResultsList.appendChild(locationItem);

        // Event listener for clicking on a search result item
        locationItem.addEventListener("click", () => {
            const longitude = locationItem.getAttribute("lon");
            const latitude = locationItem.getAttribute("lat");

            const coordinates = {
                lon: longitude,
                lat: latitude
            };
            const coordinatesData = JSON.stringify(coordinates);

            localStorage.removeItem("coordinates");
            localStorage.setItem("coordinates", coordinatesData);
            getWeatherData(longitude, latitude);

            const resultList = document.getElementById("search_results");
            resultList.innerHTML = "";
        });
    }
}

// Function to update the weather data display
function updateWeatherData(weatherData) {
    const weatherDisplay = document.getElementById("weather_data");
    weatherDisplay.innerHTML = "";

    // Check if the required weather data is present in the API response
    if (weatherData.name && weatherData.main && weatherData.main.temp) {
        const cityName = document.createElement("h3");
        cityName.innerText = weatherData.name;

        const temperature = document.createElement("p");
        temperature.innerText = `Temperature : ${weatherData.main.temp} °C`;

        const weather = document.createElement("p");
        weather.innerText = `Weather : ${weatherData.weather[0].description}`;


        const humidity = document.createElement("p");
        humidity.innerText = `Humidity : ${weatherData.main.humidity} %`;

        weatherDisplay.append(cityName, temperature, weather, humidity);
    } else {
        console.error("Incomplete or missing data in the API response.");
    }
}

// Function to fetch and display weather data for a given location
async function getWeatherData(longitude, latitude) {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lon=${longitude}&lat=${latitude}&appid=${API_KEY}&units=metric`;
    try {
        const response = await fetch(weatherApiUrl);
        const weatherData = await response.json();
        updateWeatherData(weatherData);
    } catch (error) {
        console.error("getWeatherData() Error:", error);
    }
}

// Function to fetch and display default weather data
function loadDefaultWeather() {
    const coordinatesData = localStorage.getItem("coordinates");
    const coordinates = JSON.parse(coordinatesData);

    const longitude = coordinates.lon;
    const latitude = coordinates.lat;
    getWeatherData(longitude, latitude);
}

// Call the loadDefaultWeather function on page load
loadDefaultWeather();
