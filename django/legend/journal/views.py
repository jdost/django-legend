from django.core.urlresolvers import reverse
from legend.journal.models import Journal, Tag
from legend.utils import response, View, JOURNAL
from math import ceil

PAGE_SIZE = 3


class Entry(View):
    def __call__(self, request, page='0', tag=None, slug=None):
        self.urls = True  # 'URLS' in request.GET
        self.json = 'JSON' in request.GET
        page = int(page)
        self.settings = JOURNAL

        if slug:
            data = self.singleEntry(slug)
        elif tag:
            data = self.tagSet(tag, page)
        else:
            data = self.baseSet(page)

        return response(request, JOURNAL, data)

    def singleEntry(self, slug):
        entry = Journal.objects.get(url=slug)
        return {
            "entry_list": [entry],
            "title": entry.title,
            "page_count": 1,
            "current_page": 0
        }

    def tagSet(self, tag, page=0):
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
            "nav": {
                "next": reverse(url_alias, kwargs={'tag': tag,
                    'page': page - 1}) if page > 0 else None,
                "prev": reverse(url_alias, kwargs={'tag': tag,
                    'page': page + 1})
            }
        }

        if self.urls or not self.json:
            url_set = []
            for i in range(0, int(ceil(set_tag.journal_set.count() /
                float(PAGE_SIZE)))):
                url_set.append(reverse(url_alias, kwargs={'tag': tag,
                     'page': i}))
            data["url_set"] = url_set

        return data

    def baseSet(self, page=0):
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

        if self.urls or not self.json:
            url_set = []
            for i in range(0, int(ceil(Journal.objects.count() /
                float(PAGE_SIZE)))):
                url_set.append(reverse(url_alias, kwargs={'page': i}))
            data["url_set"] = url_set

        return data


class RSS(View):
    def __call__(self, request):
        return ""
