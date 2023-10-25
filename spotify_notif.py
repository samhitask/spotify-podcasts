from datetime import datetime, timedelta
import spotipy
import cred

def getMS (msec):
            seconds = msec / 1000
            min = int(seconds // 60)
            sec = int(seconds% 60)
            return "{:02d}".format(min)+ ":" + "{:02d}".format(sec)
def getPodcasts():
    # establishing authentication
    scope = "user-read-playback-position", "user-library-read"
    sp = spotipy.Spotify(auth_manager=spotipy.SpotifyOAuth
                            (client_id=cred.CLIENT_ID, client_secret= cred.CLIENT_SECRET,
                            redirect_uri=cred.REDIRECT_URI, scope=scope))

    episode_ids = current_user_saved_shows()

    print('\n')
    unsorted_episodes = list()
    for id in episode_ids:
        results = sp.show_episodes(show_id=id, limit=5)
        for idx, item in enumerate(results['items']):
            duration = getMS(item['duration_ms'])
            unsorted_episodes.append({'show': sp.show(id)['name'],
                                      'name': item['name'],
                                      'release_date': datetime.strptime(item['release_date'], '%Y-%m-%d').date(),
                                      'total': duration})

    episodes = sorted(unsorted_episodes, key= lambda x: x['release_date'])
    episodes.reverse()
    today = datetime.today().date()

    podcasts = list()
    date = episodes[0]['release_date']
    podcasts.append(date.strftime("%B %d, %Y"))
    podcasts.append('[' + episodes[0]['show'] + ']',episodes[0]['name'], '//', episodes[0]['total'])
    for i in range(1, episodes.__len__()):
        if (today - timedelta(days=10) <= date <= today):
            if episodes[i]['release_date'] != date:
                date = episodes[i]['release_date']
                podcasts.append('\n', date.strftime("%B %d, %Y"))
            podcasts.append('[' + episodes[i]['show'] + ']',episodes[i]['name'], '//', episodes[i]['total'])
    return podcasts
