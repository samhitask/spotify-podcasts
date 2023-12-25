from flask import Flask, render_template 
import spotify_notif

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html", podcasts = spotify_notif.getPodcasts())
    
@app.route("/about")
def about():
    return render_template("about.html")

if __name__ == "__main__":
    app.run(debug=True)