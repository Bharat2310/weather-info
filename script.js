document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "8d8ffe257cab5a16ceb69d5a80c059a4";
  const weatherBtn = document.getElementById("get-weather-btn");
  const geoBtn = document.getElementById("geo-btn");
  const unitToggle = document.getElementById("unit-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  const weatherInfo = document.getElementById("weather-info");
  const cityInput = document.getElementById("city-input");
  const cityName = document.getElementById("city-name");
  const descriptionDisplay = document.getElementById("description");
  const errorMessage = document.getElementById("error-message");
  const temperatureDisplay = document.getElementById("temperature");
  const humidityDisplay = document.getElementById("humidity");
  const windDisplay = document.getElementById("wind");
  const sunriseDisplay = document.getElementById("sunrise");
  const sunsetDisplay = document.getElementById("sunset");
  const weatherIcon = document.getElementById("weather-icon");

  let currentUnit = "metric"; 
  let lastWeatherData = null;

  // Weather icon mapping based on OpenWeatherMap icon code
  function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  // Format time from UNIX timestamp
  function formatTime(unix, timezoneOffset) {
    const date = new Date((unix + timezoneOffset) * 1000);
    return date.toUTCString().slice(-12, -7);
  }

  // Fetch weather data by city name
  async function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    return await response.json();
  }

  // Fetch weather data by coordinates
  async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location not found");
    return await response.json();
  }

  function showWeatherData(data) {
    lastWeatherData = data;
    const { name, main, weather, wind, sys, timezone } = data;
    cityName.textContent = name;
    temperatureDisplay.textContent = `Temperature: ${Math.round(main.temp)}°${currentUnit === "metric" ? "C" : "F"}`;
    descriptionDisplay.textContent = `Weather: ${weather[0].description}`;
    humidityDisplay.textContent = `Humidity: ${main.humidity}%`;
    windDisplay.textContent = `Wind: ${wind.speed} ${currentUnit === "metric" ? "m/s" : "mph"}`;
    sunriseDisplay.textContent = `Sunrise: ${formatTime(sys.sunrise, timezone)}`;
    sunsetDisplay.textContent = `Sunset: ${formatTime(sys.sunset, timezone)}`;
    weatherIcon.src = getWeatherIconUrl(weather[0].icon);
    weatherIcon.alt = weather[0].main;
    weatherInfo.classList.remove("hidden");
    errorMessage.classList.add("hidden");
  }

  function showError(msg = "City not found. Please try again.") {
    weatherInfo.classList.add("hidden");
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");
  }

  weatherBtn.addEventListener("click", async () => {
    const city = cityInput.value.trim();
    if (!city) return;
    try {
      const weatherData = await fetchWeatherData(city);
      showWeatherData(weatherData);
    } catch (error) {
      showError();
    }
  });

  geoBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const weatherData = await fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        showWeatherData(weatherData);
      } catch (error) {
        showError("Unable to fetch weather for your location.");
      }
    }, () => {
      showError("Permission denied for geolocation.");
    });
  });

  unitToggle.addEventListener("click", async () => {
    currentUnit = currentUnit === "metric" ? "imperial" : "metric";
    if (lastWeatherData) {
      // Refetch by city to get accurate unit conversion
      const city = lastWeatherData.name;
      try {
        const weatherData = await fetchWeatherData(city);
        showWeatherData(weatherData);
      } catch (error) {
        showError();
      }
    }
    unitToggle.textContent = currentUnit === "metric" ? "°C / °F" : "°F / °C";
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
  });

  // Optional: Enter key triggers search
  cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") weatherBtn.click();
  });
});
