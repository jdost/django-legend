from django.shortcuts import render_to_response
from legend.utils import *

def about(request):
   return response(request, ABOUT, { "title": ABOUT['title'] })

def admin(request):
   return render_to_response("admin.html", { "page": DEFAULT})
