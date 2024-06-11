from flask import Flask, render_template, jsonify
from flask_caching import Cache
import spotify_notif

app = Flask(__name__)
cache = Cache(app)

# stores api response for 1 hour
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 3600  # 1 hr



@app.route('/')
@cache.cached()  # caches the view function with default timeout
def home():
    podcasts = spotify_notif.getPodcasts()
    return render_template('index.html', podcasts=podcasts)

if __name__ == '__main__':
    app.run(debug=True)