from django.conf.urls.defaults import url, patterns

urlpatterns = patterns('journal.views',
    url(r'^$', 'Entry', name='base'),
    url(r'^(?P<page>\d*)/$', 'Entry', name='base_paged'),
    url(r'^(?P<slug>\w*)/$', 'Entry', name='single'),
    url(r'^@(?P<tag>\w*)/$', 'Entry', name='tag'),
    url(r'^@(?P<tag>\w*)/(?P<page>\d*)/$', 'Entry', name='tag_paged'),
)
