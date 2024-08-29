from datetime import datetime, timedelta
from typing import Dict, List
from markupsafe import Markup
import spotipy
import cred


def getShows(sp):
    saved_shows = sp.current_user_saved_shows(limit=20)  
    shows_list = []

    for item in saved_shows['items']:
        show = item['show']
        added_at = datetime.strptime(item['added_at'], '%Y-%m-%dT%H:%M:%SZ').date()
        description = show['description']  
        
        show_info = {
            'name': show['name'],
            'added_at': added_at.strftime('%B %d, %Y'),
            'description': description,
            'play_url': show['external_urls']['spotify'],
            'images': show['images'][0]['url'] if show['images'] else None
        }
        
        shows_list.append(show_info)
    shows_list = sorted(shows_list, key=lambda x: datetime.strptime(x['added_at'], '%B %d, %Y'), reverse=True)
    return shows_list
    
def getMS(ms: int) -> str:
    hours = ms // 3600000
    minutes = (ms % 3600000) // 60000
    seconds = (ms % 60000) // 1000
    
    if hours > 0:
        return f"{hours}hrs {minutes:02}m {seconds:02}s"
    else:
        return f"{minutes}m {seconds}s"

def getPodcasts(sp) -> List[Dict]:
    # Fetch saved shows of the user
    show_list = sp.current_user_saved_shows(limit=20)  # Adjust limit as needed
    show_ids = [item['show']['id'] for item in show_list['items']]
    
    unsorted_episodes = []

    # Fetch episodes for each saved show
    for show_id in show_ids:
        # Fetch episodes for the given show
        results = sp.show_episodes(show_id=show_id, limit=10, market='US')
        show_data = sp.show(show_id)  # Fetch show details to include show-specific information

        for item in results['items']:
            duration = getMS(item['duration_ms'])  # Converts milliseconds to the appropriate time format
            release = datetime.strptime(item['release_date'], '%Y-%m-%d').date()
            description = item.get('description', '')

            episode = {
                'show': show_data['name'],
                'show_image': show_data['images'][0]['url'] if show_data['images'] else None,
                'show_url': show_data['external_urls']['spotify'],
                'name': item['name'],
                'description': description,
                'play_url': item['external_urls']['spotify'],
                'raw_date': release,
                'release_date': release.strftime('%B %d, %Y'),
                'total': duration,
            }
            unsorted_episodes.append(episode)

    # Sort episodes by their release date in descending order
    sorted_episodes = sorted(unsorted_episodes, key=lambda x: x['raw_date'], reverse=True)
    
    return sorted_episodes
