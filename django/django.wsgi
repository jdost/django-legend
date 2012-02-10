#!/usr/bin/python2
import os
import sys

path = '/srv/http/jostendorf/django'
if path not in sys.path:
   sys.path.append(path)
app_path = '/srv/http/jostendorf/django/legend'
if app_path not in sys.path:
   sys.path.append(app_path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'legend.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
