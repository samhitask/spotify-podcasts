from datetime import datetime, timedelta
from markupsafe import Markup
from bs4 import BeautifulSoup
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
    for i in range(0, show_list['total']):
        show_ids.append(show_list['items'][i]['show']['id'])
 
    unsorted_episodes = list(dict())
    for id in show_ids:
        results = sp.show_episodes(show_id=id, limit=10, market='US')
        for idx, item in enumerate(results['items']):
            duration = getMS(item['duration_ms'])
            release =  datetime.strptime(item['release_date'], '%Y-%m-%d').date()
            description = item['html_description'];
            ep = {'show': sp.show(id)['name'],
                'name': item['name'],
                'description': Markup(extract_first_paragraph(description)),
                'play-url': item['external_urls']['spotify'],
                'raw_date': release,
                'release_date': release.strftime('%B %d, %Y'),
                'total': duration}
            unsorted_episodes.append(ep)

    episodes = sorted(unsorted_episodes, key= lambda x: x['raw_date'])
    episodes.reverse()
    
    return episodes

def extract_first_paragraph(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    first_paragraph = soup.find('p')
    if first_paragraph:
        return str(first_paragraph)
    return ''