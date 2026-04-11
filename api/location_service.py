"""
Location Service — IP-based geolocation using ipstack API.
Detects user's state, district/city, and coordinates from their IP address.
"""

import os
import requests

IPSTACK_API_KEY = os.environ.get("IPSTACK_API_KEY", "")

# Map ipstack region names to our standard Indian state names
STATE_NAME_MAP = {
    "uttar pradesh": "Uttar Pradesh",
    "madhya pradesh": "Madhya Pradesh",
    "andhra pradesh": "Andhra Pradesh",
    "arunachal pradesh": "Arunachal Pradesh",
    "himachal pradesh": "Himachal Pradesh",
    "jammu and kashmir": "Jammu and Kashmir",
    "tamil nadu": "Tamil Nadu",
    "west bengal": "West Bengal",
    "maharashtra": "Maharashtra",
    "karnataka": "Karnataka",
    "gujarat": "Gujarat",
    "rajasthan": "Rajasthan",
    "bihar": "Bihar",
    "punjab": "Punjab",
    "haryana": "Haryana",
    "jharkhand": "Jharkhand",
    "chhattisgarh": "Chhattisgarh",
    "uttarakhand": "Uttarakhand",
    "kerala": "Kerala",
    "telangana": "Telangana",
    "odisha": "Odisha",
    "assam": "Assam",
    "goa": "Goa",
    "tripura": "Tripura",
    "meghalaya": "Meghalaya",
    "manipur": "Manipur",
    "mizoram": "Mizoram",
    "nagaland": "Nagaland",
    "sikkim": "Sikkim",
    "delhi": "Delhi",
    "national capital territory of delhi": "Delhi",
    "chandigarh": "Chandigarh",
    "puducherry": "Puducherry",
    "pondicherry": "Puducherry",
}


def _normalize_state(region_name: str) -> str:
    """Normalize ipstack region_name to our standard state name."""
    if not region_name:
        return ""
    lower = region_name.strip().lower()
    if lower in STATE_NAME_MAP:
        return STATE_NAME_MAP[lower]
    # Title case fallback
    return region_name.strip().title()


def get_location_from_ip(ip: str) -> dict:
    """
    Call ipstack API to get location from IP address.
    Returns: { state, city, latitude, longitude, country, raw }
    """
    if not IPSTACK_API_KEY:
        return {
            "state": "",
            "city": "",
            "latitude": 0,
            "longitude": 0,
            "country": "",
            "error": "IPSTACK_API_KEY not configured",
        }

    try:
        url = f"http://api.ipstack.com/{ip}"
        params = {
            "access_key": IPSTACK_API_KEY,
            "fields": "country_name,region_name,city,latitude,longitude,zip",
        }
        resp = requests.get(url, params=params, timeout=5)
        data = resp.json()

        if data.get("error"):
            error_info = data["error"].get("info", "Unknown error")
            return {
                "state": "",
                "city": "",
                "latitude": 0,
                "longitude": 0,
                "country": "",
                "error": f"ipstack error: {error_info}",
            }

        state = _normalize_state(data.get("region_name", ""))
        city = data.get("city", "")
        latitude = data.get("latitude", 0)
        longitude = data.get("longitude", 0)
        country = data.get("country_name", "")

        return {
            "state": state,
            "city": city,
            "latitude": latitude or 0,
            "longitude": longitude or 0,
            "country": country,
            "source": "ipstack",
        }

    except requests.Timeout:
        return {
            "state": "",
            "city": "",
            "latitude": 0,
            "longitude": 0,
            "country": "",
            "error": "ipstack request timed out",
        }
    except Exception as e:
        return {
            "state": "",
            "city": "",
            "latitude": 0,
            "longitude": 0,
            "country": "",
            "error": f"Location detection failed: {str(e)}",
        }
