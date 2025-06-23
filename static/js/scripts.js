// Show spinner on form submission
document.querySelector('form').addEventListener('submit', function () {
    document.getElementById('spinner').style.display = 'block';
});

// Hide spinner when page fully loads
window.addEventListener('load', function () {
    document.getElementById('spinner').style.display = 'none';
});

document.querySelector('select[name="forecast_type"]').addEventListener('change', function () {
    const form = this.form;
    const cityInput = form.querySelector('input[name="city"]');
    const latitude = form.querySelector('#latitude').value;
    const longitude = form.querySelector('#longitude').value;

    const hasCoords = latitude && longitude;
    const hasCity = cityInput.value.trim() !== "";

    // Only remove city input if it's blank and no coords are present
    if (!hasCity && !hasCoords) {
        // Remove the city input so it's not sent at all
        cityInput.parentNode.removeChild(cityInput);
    }

    document.getElementById('spinner').style.display = 'block';
    form.submit();
});

// Utility function to get a cookie by name
function getCookie(name) {
    const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? match.pop() : '';
}

// Get location and submit form
document.getElementById('get-location').addEventListener('click', function (e) {
    e.preventDefault();
    const errorDiv = document.getElementById('location-error');

    // Clear previous error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (navigator.geolocation) {
        document.getElementById('spinner').style.display = 'block';

        navigator.geolocation.getCurrentPosition(
            function (position) {
                document.getElementById('latitude').value = position.coords.latitude;
                document.getElementById('longitude').value = position.coords.longitude;

                // Clear city field
                const cityInput = document.querySelector('input[name="city"]');
                if (cityInput) cityInput.value = "";

                document.getElementById('weather-form').submit();
            },
            function (error) {
                let message = 'Unable to retrieve your location.';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Location permission was denied.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    message = 'Location information is unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    message = 'Location request timed out.';
                }
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 6318);


                errorDiv.textContent = message;
                errorDiv.style.display = 'inline-block';
                document.getElementById('spinner').style.display = 'none';
                console.error('Geolocation error:', error);
            }
        );
    } else {
        errorDiv.textContent = 'Geolocation is not supported by your browser.';
        errorDiv.style.display = 'inline-block';
    }
});


window.addEventListener('load', function () {
    document.getElementById('spinner').style.display = 'none';

    const cityInput = document.querySelector('input[name="city"]');
    const lastCity = getCookie('last_city');
    const container = document.getElementById('city-container');

    if (cityInput && lastCity && cityInput.value.trim() === "") {
        // Remove leading/trailing quotes if present
        const cleanCity = lastCity.replace(/^"(.*)"$/, '$1');
        cityInput.value = cleanCity;

        // Highlight input + enable tooltip
        cityInput.classList.add('highlighted');
        container.classList.add('highlighted');
    }

    // Remove highlight and tooltip on input change
    cityInput.addEventListener('input', () => {
        cityInput.classList.remove('highlighted');
        container.classList.remove('highlighted');
    });
});