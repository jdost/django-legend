from django.http import HttpResponse
from django.shortcuts import render_to_response
from legend.journal.models import *
from legend.journal import forms
from legend.utils import *
from re import sub
import calendar, datetime, string, json

# Create your views here.

def default(request, page=0):
	page = int(page)

	ts = Tag.objects.all()
	es = Journal.objects.order_by('-date')[(page*5):(page*5+5)]
	bool = not ((len(es) < 5) or (es[4].id == 0))
	h = gen_header()

	return render_to_response('journal.html', {'journal': True, 'pagename': 'Journal',
										'taglist': ts, 'entrylist': es, 'single': False,
										'page': page, 'end': bool, 'header': h})

def single(request, slug):
	ts = Tag.objects.all()
	es = []
	es.append(Journal.objects.get(url = slug))
	title = 'journal: ' + es[0].title
	h = gen_header()
	
	return render_to_response('journal.html', {'journal': True, 'pagename': title, 
								'taglist': ts, 'entrylist': es, 'single': True, 'form': forms.CommentForm(),
								'page': -1, 'header': h})

def tag(request, slug, page=0):
	page = int(page)

	ts = Tag.objects.all()
	es = []
	
	target = Tag.objects.get(url = slug)
	etemp = target.journal_set.order_by('-date')[(page*5):(page*5+5)]
	for e in etemp:
		if e.tags.filter(url = slug).count() > 0:
			es.append(e)
	h = gen_header()
	
	return render_to_response('journal.html', {'journal': True, 'pagename': 'Journal: ' + target.name, 
										'taglist': ts, 'entrylist': es, 'single': False, 'header': h})

def cal(request, yr, mth):
	yr = int(yr)
	mth = int(mth)
	
	base = {}
	if mth == 0:		base["Month"] = "Jan"
	elif mth == 1:		base["Month"] = "Feb"
	elif mth == 2:		base["Month"] = "Mar"
	elif mth == 3:		base["Month"] = "Apr"
	elif mth == 4:		base["Month"] = "May"
	elif mth == 5:		base["Month"] = "June"
	elif mth == 6:		base["Month"] = "July"
	elif mth == 7:		base["Month"] = "Aug"
	elif mth == 8:		base["Month"] = "Sept"
	elif mth == 9:		base["Month"] = "Oct"
	elif mth == 10:		base["Month"] = "Nov"
	else:				base["Month"] = "Dec"
	
	stats = calendar.monthrange(yr, mth+1)
	if stats[0] == 6:
		base["Dead"] = -1
	elif mth == 0:
		base["Dead"] = calendar.monthrange(yr-1, 12)[1] - stats[0]
	else:
		base["Dead"] = calendar.monthrange(yr, mth)[1] - stats[0]
	
	arts = Journal.objects.filter(date__month=(mth+1), date__year=yr)
	data = []
	for a in arts:
		data.append({"Date": a.date.day, "Title": a.title, "URL": a.url})
	
	base["Dates"] = data;
	
	return HttpResponse(json.dumps(base, indent=4), mimetype="json/application")

def comment(request, entry):
	entry = Journal.objects.get(id = entry)
	comment = Comment()
	
	comment.author = request.POST["u"]
	comment.content = request.POST["c"]
	comment.time = request.POST["d"]
	comment.entry = entry
	comment.save()
	
	return HttpResponse(json.dumps({ "author": comment.author, "content": comment.content, "time": comment.time },
							indent=4), mimetype="json/application")