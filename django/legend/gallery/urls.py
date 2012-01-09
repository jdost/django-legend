from django.conf.urls.defaults import *
from legend import gallery

urlpatterns = patterns('gallery.views',
	(r'^$', 'default'),
	(r'^json/(?P<album>\w+)/$', 'album'),
	(r'^(?P<album>\w+)/$', 'albumStatic'),
	(r'^(?P<album>\w+)/thumb/(?P<img>\w+)/$', 'thumb'),
	(r'^(?P<album>\w+)/(?P<img>\w+)/$', 'image'),
)
