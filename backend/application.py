from datetime import datetime, timedelta
from flask import Flask, jsonify, request, redirect, session
from flask_caching import Cache
from flask_cors import CORS
from spotipy.oauth2 import SpotifyOAuth
import spotipy
import spotify_notif as spotify_notif
import cred
import secrets
import logging

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:5000"])

# Configure caching
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 3600  # 1 hour
cache = Cache(app)
cache.init_app(app)


# Spotify OAuth configuration
def create_spotify_oauth():
    return SpotifyOAuth(
        client_id=cred.CLIENT_ID,
        client_secret=cred.CLIENT_SECRET,
        redirect_uri=cred.REDIRECT_URI,
        scope='user-library-read user-read-playback-position'
    )

# Function to get token info, using caching
def get_cached_token():
    token_info = cache.get("token_info")

    if not token_info:
        logging.debug("No token_info found in cache.")
        return None

    logging.debug(f"Token info found in cache: {token_info}")

    now = datetime.now()
    is_expired = datetime.fromtimestamp(token_info['expires_at']) - now < timedelta(seconds=60)

    logging.debug(f"Token expiration check: now={now}, expires_at={datetime.fromtimestamp(token_info['expires_at'])}, is_expired={is_expired}")

    if is_expired:
        logging.debug("Token expired, attempting to refresh...")
        sp_oauth = create_spotify_oauth()
        try:
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            token_info['expires_at'] = int((datetime.now() + timedelta(seconds=token_info['expires_in'])).timestamp())
            cache.set("token_info", token_info)
            logging.debug(f"Token successfully refreshed: {token_info}")
        except Exception as e:
            logging.error(f"Error refreshing token: {e}")
            return None

    return token_info

@app.route('/token')
def token():
    token_info = get_cached_token()
    if token_info:
        return jsonify(token_info)
    else:
        logging.error("Token retrieval failed, returning 401")
        return jsonify({"error": "No token info"}), 401

@app.route('/login')
def login():
    sp_oauth = create_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)
@app.route('/callback')
def callback():
    sp_oauth = create_spotify_oauth()
    code = request.args.get('code')

    if not code:
        logging.error("No code provided in callback")
        return jsonify({"error": "No authorization code provided"}), 400

    try:
        token_info = sp_oauth.get_access_token(code, check_cache=False)
        logging.debug(f"Token info received: {token_info}")

        if not token_info:
            logging.error("Failed to get token info")
            return jsonify({"error": "Failed to get token info"}), 500

        token_info['expires_at'] = int((datetime.now() + timedelta(seconds=token_info['expires_in'])).timestamp())
        cache.set("token_info", token_info)
        logging.info("Token info successfully cached")

        return redirect('http://localhost:3000/dashboard')  # Redirect to your Next.js app
    except spotipy.SpotifyOauthError as e:
        logging.error(f"Spotify OAuth error: {str(e)}")
        return jsonify({"error": "Authentication failed", "details": str(e)}), 400
    except Exception as e:
        logging.error(f"Error in callback: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    
@app.route('/')
@cache.cached(timeout=3600)
def home():
    try:
        token_info = get_cached_token()
        if token_info is None:
            raise Exception("No valid token found.")
        sp = spotipy.Spotify(auth=token_info['access_token'])
        
        logging.info("Fetching shows...")
        show_list = spotify_notif.getShows(sp)
        logging.info(f"Found {len(show_list)} shows")
        
        logging.info("Fetching podcasts...")
        podcasts = spotify_notif.getPodcasts(show_list, sp)
        logging.info(f"Found {len(podcasts)} podcasts")
        
        return jsonify(podcasts)
    except Exception as e:
        logging.error(f"Error in home route: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 401

@app.route('/shows')
@cache.cached()
def getShows():
    try:
        token_info = get_cached_token()
        if token_info is None:
            raise Exception("No valid token found.")
        spotify_notif.sp = spotipy.Spotify(auth=token_info['access_token'])
        return jsonify(spotify_notif.getShows())
    except Exception as e:
        logging.error(f"Error in getShows route: {e}")
        return jsonify({"error": str(e)}), 401

@app.route('/config', methods=['POST'])
def configure_frontend():
    if request.method == 'POST':
        data = request.json  # Assuming frontend sends JSON data
        message = f"Received configuration: {data}"
        return jsonify({'message': message})
    return jsonify({'error': 'Method not allowed'}), 405

@app.route('/logout')
def logout():
    session.clear()
    cache.clear()  # Clear the cache on logout
    logging.debug("Session and cache cleared on logout.")
    return jsonify({"success": True, "message": "Logged out successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)
