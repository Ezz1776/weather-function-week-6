const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const MAX_RECENT = 5;

// DOM elements
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const weatherDisplay = document.getElementById("weather-display");
const historyList = document.getElementById("search-history");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");

// STEP 1 — Fetch weather
async function fetchWeather(city) {
    const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("City not found");
        } else if (response.status === 401) {
            throw new Error("API key not valid yet");
        } else {
            throw new Error("Failed to fetch weather data");
        }
    }

    return await response.json();
}

// STEP 2 — Get weather
async function getWeather(city) {
    if (typeof API_KEY === "undefined" || !API_KEY) {
        showError("Missing API key: copy config.example.js to config.js");
        return;
    }

    showLoading();
    hideError();

    try {
        const data = await fetchWeather(city);
        displayWeather(data);
        saveToHistory(data.name);
    } catch (err) {
        showError(
            err.name === "TypeError"
                ? "Network error — check your connection"
                : err.message
        );
    } finally {
        hideLoading();
    }
}

// STEP 3 — Display weather
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt = data.weather[0].description;

    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    weatherDisplay.classList.remove("hidden");
}

// Helpers
function showLoading() {
    loading.classList.remove("hidden");
    weatherDisplay.classList.add("hidden");
}

function hideLoading() {
    loading.classList.add("hidden");
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

function hideError() {
    errorBox.classList.add("hidden");
}

// STEP 4 — Recent searches
function loadRecent() {
    try {
        return JSON.parse(localStorage.getItem("recent")) || [];
    } catch (error) {
        return [];
    }
}

function saveToHistory(city) {
    recent = recent.filter(
        item => item.toLowerCase() !== city.toLowerCase()
    );

    recent.unshift(city);
    recent = recent.slice(0, MAX_RECENT);

    localStorage.setItem("recent", JSON.stringify(recent));

    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";

    recent.forEach(city => {
        const li = document.createElement("li");
        const button = document.createElement("button");

        button.className = "history-item";
        button.textContent = city;

        li.appendChild(button);
        historyList.appendChild(li);
    });
}

let recent = loadRecent();

// STEP 5 — Events

form.addEventListener("submit", event => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city");
        return;
    }

    getWeather(city);
});

historyList.addEventListener("click", event => {
    const btn = event.target.closest(".history-item");

    if (btn) {
        getWeather(btn.textContent);
    }
});

// Render recent searches
renderHistory();