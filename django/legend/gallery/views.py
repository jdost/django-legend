from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
import legend.gallery.models as m
from legend.utils import View, response, GALLERY

from math import ceil

PAGE_SIZE = 25


class Gallery(View):
    '''
    Gallery:
        The <Gallery> view is a simple view, it is the base landing page for
        the gallery module, it just gives all of the <Album> objects to the
        template.
    '''
    def __call__(self, request):
        data = {
            "album_list": self.get_albums(),
            "title": GALLERY["title"]
        }
        return response(request, GALLERY, data)

    def get_albums(self):
        '''
        get_albums:
            simple utility function, just grabs all of the <Album> objects
            from the DB
        '''
        return m.Album.objects.all()


class Album(View):
    '''
    The <Album> view is the wrapper for all template requests dealing with
    a specific <Album> object.  The actions this covers are requesting a
    base HTML page of the album, a JSON description of another page of
    the album, or a specific <Image> to be viewed.  This last part is
    where the 302 is used and the view stats are tracked for the image.
    '''
    def __call__(self, request, album=None, image=None, page="0"):
        if album is None:
            return HttpResponse(status=400)

        self.album = m.Album.objects.get(url=album)
        self.settings = GALLERY

        if image is None:
            return self.album_list(request, page)
        return self.handle_image(image)

    def handle_image(self, image):
        '''
        The method called when viewing a specific image, just increments
        the <Image>'s view count and generates a redirect to the static URL.
        '''
        image = self.album.image_set.get(url=image)
        image.views += 1
        image.save()
        return HttpResponseRedirect(image.get_static_url())

    def album_list(self, request, page):
        '''
        The method called for any page of the album.  The page is just an
        offset within the imageset.  This just generates the dictionary
        structure describing the album and the current page, this is all then
        used by the template HTML or turned into a JSON packet for async
        usage.
        '''
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
