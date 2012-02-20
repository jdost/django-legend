from django.shortcuts import render_to_response
from legend.utils import *

def about(request):
   return response(request, ABOUT, {})

def admin(request):
   return render_to_response("admin.html", { "page": DEFAULT})
