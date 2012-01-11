from legend.gallery.models import Header
import random

class HeaderImage:
   def __init__(self, caption, file):
      self.caption = caption
      self.file = "/style/img/header/" + file

def gen_header():
    rand = random.randrange(1, Header.objects.count()) + 1
    header = Header.objects.get(id=rand)
    return HeaderImage(header.caption, header.file)
