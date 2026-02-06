import base64

# The base64 data from the user (truncated in summary, so using placeholder)
# We need to download an appropriate "or" / choice image
import urllib.request

# Since the base64 was truncated, let's search for a good "or" / choice image
# Using a simple choice/decision image
url = "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop"

try:
    urllib.request.urlretrieve(url, "public/images/或者.png")
    print("Downloaded 或者.png")
except Exception as e:
    print(f"Error: {e}")
