from flask import Flask, render_template, request, redirect, make_response
import requests
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# API key for OpenWeatherMap (retrieved from environment variable)
API_KEY = os.getenv("KEY")  # Load API key from the .env file

def get_daily_forecast(forecast_list):
    daily_forecasts = {}
    for item in forecast_list:
        # Extract date from the datetime string
        date = item["dt_txt"].split(" ")[0]
        if date not in daily_forecasts:
            daily_forecasts[date] = {
                "datetime": datetime.strptime(date, "%Y-%m-%d").strftime("%-d %B %Y"),
                "temperature": 0,
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"],
                "count": 0
            }
        daily_forecasts[date]["temperature"] += item["main"]["temp"]
        daily_forecasts[date]["count"] += 1

    # Calculate average temperature for each day
    for date, data in daily_forecasts.items():
        data["temperature"] = round(data["temperature"] / data["count"], 1)

    return list(daily_forecasts.values())

@app.route("/", methods=["GET", "POST"])
def index():
    weather_data = None
    theme = request.cookies.get("theme", "light")

    city = request.form.get("city") if request.method == "POST" else request.cookies.get("last_city")
    forecast_type = request.form.get("forecast_type") or request.cookies.get("forecast_type") or "daily"

    if city:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    else:
        return render_template("index.html", weather=None, forecast=None, forecast_type="daily", theme=theme)

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        weather_data = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "condition": data["weather"][0]["main"].lower()
        }

        # Get forecast
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"

        forecast_response = requests.get(forecast_url)
        forecast_data = []

        if forecast_response.status_code == 200:
            raw_forecast = forecast_response.json()["list"]
            if forecast_type == "daily":
                forecast_data = get_daily_forecast(raw_forecast)
            else:
                for item in raw_forecast:
                    item["formatted_dt"] = datetime.strptime(item["dt_txt"], "%Y-%m-%d %H:%M:%S").strftime("%-d %B %Y %H:%M")
                forecast_data = raw_forecast
        else:
            forecast_data = None

        resp = make_response(render_template("index.html", weather=weather_data, forecast=forecast_data, forecast_type=forecast_type, theme=theme))
        if city:
            resp.set_cookie("last_city", city, max_age=7*24*60*60)
        resp.set_cookie("forecast_type", forecast_type, max_age=7*24*60*60)
        return resp
    else:
        weather_data = {"error": "Could not retrieve weather information."}
        return render_template("index.html", weather=weather_data, forecast=None, forecast_type=forecast_type, theme=theme)


@app.route("/toggle-theme")
def toggle_theme():
    """
    Toggle between light and dark themes for the app.
    """
    current_theme = request.cookies.get("theme", "light")
    new_theme = "dark" if current_theme == "light" else "light"

    resp = make_response(redirect("/"))
    resp.set_cookie("theme", new_theme, max_age=30*24*60*60)  # Cookie valid for 30 days
    return resp

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)