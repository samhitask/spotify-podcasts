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

    episode_ids=['732eFL1RZRahaeu3HgCkJB','6mTel3azvnK8isLs4VujvF', '07SjDmKb9iliEzpNcN2xGD', '4zmVd1CGeUCxAAMwGAwsFD',
                    '1FGGKjWUwKesloB1pL7srx', '10TI0u482gcHsEubx6Eott', '6ups0LMt1G8n81XLlkbsPo', '64hSJ12039GyxN2FZrueUd',
                    '6z4NLXyHPga1UmSJsPK7G1', '7sA60f94UXwZDH1EJC4obI', '6EEUw7cOQ6ZqGJpe7QLRbw', '2IHYyH87D5gDc4UH61YcrU',
                    '2AJE3OvWGD0N2KwHQJwlDA', '4KnB6LzFr1PHPs8NWdr96Q', '5tObaoAimbLiA7vtj3f7RS', '1lUPomulZRPquVAOOd56EW',
                    '4oUZ3Yut3T1hbpfNjRjrsO', '3IcA76e8ZV0NNSJ81XHQUg', '6L47MDMO3xuN2XBed7miEI', '2sYCMjQed0gHYtXzPvcj5K']

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
"""
    the a24 podcast: 732eFL1RZRahaeu3HgCkJB
    the big picture: 6mTel3azvnK8isLs4VujvF
    the bill simmons podcast: 07SjDmKb9iliEzpNcN2xGD
    blank check with griffin & david: 4zmVd1CGeUCxAAMwGAwsFD
    cerebro: 1FGGKjWUwKesloB1pL7srx
    the director's cut - a dga podcast: 10TI0u482gcHsEubx6Eott
    the filmcast (AKA the slashfilmcast): 6ups0LMt1G8n81XLlkbsPo
    filmspotting - movie reviews: 64hSJ12039GyxN2FZrueUd
    freakonomics radio: 6z4NLXyHPga1UmSJsPK7G1
    the letterboxd show: 7sA60f94UXwZDH1EJC4obI
    the neoliberal podcast: 6EEUw7cOQ6ZqGJpe7QLRbw
    the new yorker: fiction: 2IHYyH87D5gDc4UH61YcrU
    the new yorker: the writer's voice: 2AJE3OvWGD0N2KwHQJwlDA
    the penguin podcast: 4KnB6LzFr1PHPs8NWdr96Q
    the prestige tv podcast: 5tObaoAimbLiA7vtj3f7RS
    the rewatchables: 1lUPomulZRPquVAOOd56EW
    ty burr's watch cast: 4oUZ3Yut3T1hbpfNjRjrsO
    the watch: 3IcA76e8ZV0NNSJ81XHQUg
    wtf with marc maron podcast: 6L47MDMO3xuN2XBed7miEI
    you must remember this: 2sYCMjQed0gHYtXzPvcj5K
"""