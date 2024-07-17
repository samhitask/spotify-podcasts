from flask import Flask, jsonify
from flask_caching import Cache
from flask_cors import CORS  # Import Flask-CORS

import spotify_notif

app = Flask(__name__)
cache = Cache(app)

# Enable CORS for all origins (replace with your frontend URL in production)
CORS(app)

# Configure caching
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 3600  # 1 hr

@app.route('/')
@cache.cached()
def home():
    podcasts = spotify_notif.getPodcasts()
    return jsonify(podcasts)

@app.route('/config', methods=['POST'])
def configure_frontend():
    if request.method == 'POST':
        data = request.json  # Assuming frontend sends JSON data
        message = f"Received configuration: {data}"
        return jsonify({'message': message})

    return jsonify({'error': 'Method not allowed'}), 405

if __name__ == '__main__':
    app.run(debug=True)
