from django.shortcuts import render_to_response
from legend.utils import response, ABOUT, DEFAULT


def about(request):
    '''
    This is a simple 'static' view that just adds in the static about.html
    template into the base.
    '''
    return response(request, ABOUT, { "title": ABOUT['title'] })


def admin(request):
    '''
    This is a simple 'static' view for the admin interface.  The interface
    does not conform to the rest of the site (does not use the base template)
    but it does require a few variables from it (such as the static file
    location).  This just passes in the default values to the admin template
    and that will get what it needs out of it.
    '''
    return render_to_response("admin.html", {"page": DEFAULT})
