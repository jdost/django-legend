import django
import os
import db
# Django settings for legend project.
DJANGO_ROOT = os.path.dirname(os.path.realpath(django.__file__))
SITE_ROOT = os.path.dirname(os.path.realpath(__file__))
WWW_ROOT = os.path.normpath(SITE_ROOT + "/../../")
ARCHIVE_LOC = os.path.join(WWW_ROOT, "archive")

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)

MANAGERS = ADMINS

DATABASE_ENGINE = 'django.db.backends.' + db.engine
                                      # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
if db.engine is 'sqlite3':
   DATABASE_NAME = os.path.join(WWW_ROOT, db.table)
else:
   DATABASE_NAME = db.table           # Or path to database file if using sqlite3.
   DATABASE_USER = db.username        # Not used with sqlite3.
   DATABASE_PASSWORD = db.password    # Not used with sqlite3.
DATABASE_HOST = db.host               # Set to empty string for localhost. Not used with sqlite3.
DATABASE_PORT = db.port               # Set to empty string for default. Not used with sqlite3.

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
STATIC_ROOT = os.path.join(WWW_ROOT, 's')
GALLERY_ROOT = os.path.join(STATIC_ROOT, 'img')
MEDIA_ROOT = os.path.join(GALLERY_ROOT, "temp")
THUMBNAIL_DIR = "thumb"
THUMBNAIL_DIM = (255,255)
MAIN_DIM = (1024,1024)
STATICFILES_DIRS = (
)

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = ''
STATIC_URL = '/s'
GALLERYIMG_URL = STATIC_URL + "/img/{album}/{image}"
THUMBNAIL_URL = STATIC_URL + "/img/{album}/" + THUMBNAIL_DIR + "/{image}"

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/style/img/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'l38#=ue4ff6e-+-@a@#jmuot*k*km-!07gu4azsadqzkh5!l(-'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'legend.urls'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
	os.path.join(SITE_ROOT, 'templates'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.staticfiles',
    'django.contrib.markup',
    'south',
    'legend.journal',
    'legend.gallery',
    'legend.ws',
    'legend.utils',
)
