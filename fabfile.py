from fabric.api import local

import os.path as p
import os

site_loc = os.getcwd()
django_loc = p.join(site_loc, 'django')
static_loc = p.join(site_loc, 's')
venv_loc = p.join("/home", "jeff", "src","backend", "venv")

def deploy():
   local("cd " + site_loc)
# setups up the log folder
   local("mkdir " + p.join(site_loc, "logs"))
# setup virtualenv
   setup_virtual()
# setup db.py file
   setup_db()
# setup misc files
   setup_js()
   compile_less()
   auth()

def setup_db():
   local("chmod +x " + p.join(site_loc, "scripts", "initdb.sh"))
   local(p.join(site_loc, "scripts", "initdb.sh") + \
         " " + p.join(django_loc, "legend", ""))

def setup_virtual():
   local('mkdir ' + venv_loc)
   local('virtualenv2 --no-site-packages ' + venv_loc)
   local('cd ' + venv_loc)
   local('ln -s ' + django_loc + ' ' + p.join(venv_loc, 'django'))
   local(p.join(site_loc, 'scripts', 'vsetup.sh') + ' ' + venv_loc)

def auth():
   auth_loc = p.join(django_loc, "legend", "ws", "AUTH")
   if not p.exists(auth_loc):
      local("echo 0 > " + auth_loc)
      return

   auth_file = open(auth_loc, "r")
   val = auth_file.read().strip()
   if val is "1":
      local("echo 0 > " + auth_loc)
   elif val is "0":
      local("echo 1 > " + auth_loc)

def compile_less():
   css_loc = p.join(static_loc, 'css')
   less_loc = p.join(static_loc, 'less')
   if not p.exists(css_loc):
      local("mkdir -p " + css_loc)
   for root, d, file_set in os.walk(less_loc):
      root = root[len(less_loc)+1:]
      if not p.exists(p.join(css_loc, root)):
         local("mkdir -p " + p.join(css_loc, root))
      for lfile in file_set:
         if not lfile.endswith(".less"):
            continue
         elif lfile == "lib.less":
            continue
         lloc = p.join(less_loc, root, lfile)
         cloc = p.join(css_loc, root, lfile.rstrip("les") + "css")
         local("lessc " + lloc + " > " + cloc)

def setup_js():
   local("mkdir -p " + p.join(static_loc, "js", "lib", "archive"))
   get_jquery()
   get_less()

def get_jquery(version="latest"):
   jquery_loc = p.join(static_loc,"js","lib","archive","jquery")
   if not p.exists(jquery_loc):
      local("mkdir -p " + jquery_loc)

   tgt_loc = p.join(jquery_loc,version)
   symlink = p.join(static_loc,"js","lib","jQuery")
   if not p.exists(p.join(tgt_loc, "jquery.min.js")) \
      or version is "latest":
      if version is "latest":
         url = "http://code.jquery.com/jquery-latest.min.js"
      else:
         url = "http://ajax.googleapis.com/ajax/libs/jquery/" + \
            version + "/jquery.min.js"

      if not p.exists(tgt_loc):
         local("mkdir " + tgt_loc)

      local("wget " + url)
      local("mv  *.min.js " + p.join(tgt_loc, "jquery.min.js"))

   if p.exists(symlink):
      local("rm " + symlink)
   local("ln -s " + p.join(tgt_loc, "jquery.min.js") + " " + symlink)

def get_less(version="1.2.1"):
   less_loc = p.join(static_loc,"js","lib","archive","less")
   if not p.exists(less_loc):
      local("mkdir -p " + less_loc)

   tgt_loc = p.join(less_loc,version)
   symlink = p.join(static_loc,"js","lib","less")
   if not p.exists(p.join(tgt_loc, "less.min.js")):
      url = "http://lesscss.googlecode.com/files/less-" + version + ".min.js"

      if not p.exists(tgt_loc):
         local("mkdir " + tgt_loc)

      local("wget " + url)
      local("mv *.min.js " + p.join(tgt_loc, "less.min.js"))

   if p.exists(symlink):
      local("rm " + symlink)
   local("ln -s " + p.join(tgt_loc, "less.min.js") + " " + symlink)
