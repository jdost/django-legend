from django.core.urlresolvers import reverse
from legend.journal.models import Journal, Tag
from legend.utils import response, View, JOURNAL
from math import ceil

# Page size set to 3 entries per page, change if desired
PAGE_SIZE = 3


class Entry(View):
    '''
    Overall entry handler, this incorporates the various ways to access the
    <Journal> entries via the main web interface.  This wraps the accessing
    of the desired <Journal> entries, packaging for either template consumption
    or JSON packaging (for dynamic loading client-side), and extended info
    for the various scenarios.
    '''
    def __call__(self, request, page='0', tag=None, slug=None):
        self.urls = True  # 'URLS' in request.GET
            # Include the URLs in the set if specified (always)
        self.json = 'JSON' in request.GET
            # the JSON parameter is all that is needed to specify the format
            # example: /journal/?JSON works (also /journal/?JSON=1 does too)
        page = int(page)  # the parameters are always strings
        self.settings = JOURNAL  # the setting stuff is used for common
            # template setup, like required JS, CSS, etc.

        if slug:  # single entry slug: /journal/my_entry/
            data = self.singleEntry(slug)
        elif tag:  # tag based url: /journal/@tag/
            data = self.tagSet(tag, page)
        else:  # generic base access, /journal/, all entries, chronological
            data = self.baseSet(page)

        return response(request, JOURNAL, data)  # common exit point, goes to
            # a handler that sets up the template and various global settings

    def singleEntry(self, slug):
        '''
        The singleEntry method will return just the <Journal> entry that the
        provided <slug> parameter pertains to.  The page set concept is for the
        pagination of the various sets of entries, each tag is its own page set
        and the base set is its own, for now, each individual entry is also its
        own page set (this will change).
        '''
        entry = Journal.objects.get(url=slug)
        return {
            "entry_list": [entry],
            "title": entry.title,
            "page_count": 1,  # the single entry is part of its own page set
            "current_page": 0
        }

    def tagSet(self, tag, page=0):
        '''
        The tagSet method will return a page from the specified tag grouping of
        the ManyToMany relationship.  The <tag> param should be the slug for one
        of the <Tag> entries (based on the <url> property).  The page value is
        used for the pagination index.
        '''
        set_tag = Tag.objects.get(url=tag)
        url_alias = "journal:tag_paged"

        data = {
            "entry_list": set_tag.journal_set.order_by('-date')[PAGE_SIZE *
                    page:PAGE_SIZE * (page + 1)],
            "title": self.settings["title"] + "@" + set_tag.name,
            "page_count": int(ceil(set_tag.journal_set.count() /
                float(PAGE_SIZE))),
            "current_page": page,
            "current_set": "journal:tag:" + tag,
            "nav": {  # These are used for the progression between pages
                "next": reverse(url_alias, kwargs={'tag': tag,
                    'page': page - 1}) if page > 0 else None,
                "prev": reverse(url_alias, kwargs={'tag': tag,
                    'page': page + 1})
            }
        }

        if self.urls or not self.json:  # URL list generation
            url_set = []
            for i in range(0, int(ceil(set_tag.journal_set.count() /
                float(PAGE_SIZE)))):
                url_set.append(reverse(url_alias, kwargs={'tag': tag,
                     'page': i}))
            data["url_set"] = url_set

        return data

    def baseSet(self, page=0):
        '''
        The baseSet method will return a page from the base set.  The base set
        is just all <Journal> entries in chronologically descending order, it
        is the common form of viewing the Journal content.  It operates much
        like the <tagSet> method, just not filtering on the ManyToMany
        relationship.
        '''
        url_alias = 'journal:base_paged'
        data = {
            "entry_list": Journal.objects.order_by('-date')[PAGE_SIZE *
                page:PAGE_SIZE * (page + 1)],
            "title": self.settings['title'],
            "page_count": int(ceil(Journal.objects.count() /
                float(PAGE_SIZE))),
            "current_page": page,
            "current_set": "journal:base",
            "nav": {
                "next": reverse(url_alias,
                    kwargs={'page': page - 1}) if page > 0 else None,
                "prev": reverse(url_alias, kwargs={'page': page + 1})
            }
        }

        if self.urls or not self.json:  # URL list generation
            url_set = []
            for i in range(0, int(ceil(Journal.objects.count() /
                float(PAGE_SIZE)))):
                url_set.append(reverse(url_alias, kwargs={'page': i}))
            data["url_set"] = url_set

        return data


class RSS(View):
    '''
    This is a stubbed function for now, it will eventually generate an RSS
    timeline for RSS readers, I am throwing around various concepts on how
    to use this, whether it should be just for the Journal stuff, or an overall
    listing of all activity on the site (image uploads, comments, etc.)
    '''
    def __call__(self, request):
        return ""
