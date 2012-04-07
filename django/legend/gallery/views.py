from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
import legend.gallery.models as m
from legend.utils import View, response, GALLERY

from math import ceil

PAGE_SIZE = 25


class Gallery(View):
    def __call__(self, request):
        data = {
            "album_list": self.getAlbums(),
            "title": GALLERY["title"]
        }
        return response(request, GALLERY, data)

    def getAlbums(self):
        return m.Album.objects.all()


class Album(View):
    def __call__(self, request, album=None, image=None, page="0"):
        if album is None:
            return HttpResponse(status=400)

        self.album = m.Album.objects.get(url=album)
        self.settings = GALLERY

        if image is None:
            return self.album_list(request, page)
        return self.handle_image(image)

    def handle_image(self, image):
        image = self.album.image_set.get(url=image)
        image.views += 1
        image.save()
        return HttpResponseRedirect(image.get_static_url())

    def album_list(self, request, page):
        page = int(page)
        url_alias = 'gallery:album_paged'
        page_count = int(ceil(self.album.image_set.count() / float(PAGE_SIZE)))
        data = {
            "album": self.album,
            "image_list": self.album.image_set.all()[page *
                PAGE_SIZE:(page + 1) * PAGE_SIZE],
            "title": self.settings["title"] + ":" + self.album.name,
            "nav": {
                "page_count": page_count,
                "pages": map(lambda p: reverse(url_alias, kwargs={'page': p,
                    'album': self.album.url}), range(page_count)),
                "current": page
            }
        }
        return response(request, self.settings, data)
