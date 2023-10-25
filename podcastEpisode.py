import datetime
class podcastEpisode:

    def __init__(self, _show: str, title: str, date: str, resume: str, total: str):
        self._show = _show
        self.title = title
        self.date = datetime.strptime(date, '%Y-%m-%d')
        self.resume = resume
        self.total = total

    @property
    def _show(self):
        return self.series
    
    @property
    def title(self):
        return self.title
    
    @property
    def date(self):
        return self.date
    
    @property
    def resume(self):
        return self.resume
    
    @property
    def total(self):
        return self.total

pd = podcastEpisode("show", "title", "2023-06-17", "time1", "time2")

print(pd.total())
print(pd.date())