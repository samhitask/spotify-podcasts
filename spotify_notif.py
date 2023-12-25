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

    show_list = sp.current_user_saved_shows(limit=20, market='US')
    show_ids = list()
    for i in range(0, show_list['total'] - 1):
        show_ids.append(show_list['items'][i]['show']['id'])
 
         
    print('\n')
    unsorted_episodes = list(dict())
    for id in show_ids:
        results = sp.show_episodes(show_id=id, limit=10, market='US')
        for idx, item in enumerate(results['items']):
            duration = getMS(item['duration_ms'])
            ep = {'show': sp.show(id)['name'],
                'name': item['name'],
                'release_date': datetime.strptime(item['release_date'], '%Y-%m-%d').date(),
                'total': duration}
            unsorted_episodes.append(ep)

    episodes = sorted(unsorted_episodes, key= lambda x: x['release_date'])
    episodes.reverse()
    today = datetime.today().date()

    podcasts = list()
    date = episodes[0]['release_date']
    podcasts.append(date.strftime("%B %d, %Y"))
    podcasts.append(" ".join(('[',  episodes[0]['show'] , ']',  episodes[0]['name'],  '//',  episodes[0]['total'])))
    for i in range(1, episodes.__len__()):
        if (today - timedelta(days=30) <= date <= today):
            if episodes[i]['release_date'] != date:
                date = episodes[i]['release_date']
                podcasts.append(" ".join(('\n', date.strftime("%B %d, %Y"))))
            podcasts.append(" ".join(('[',  episodes[i]['show'] , ']',  episodes[i]['name'],  '//',  episodes[i]['total'])))
    return podcasts
