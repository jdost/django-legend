from django import template
from django.utils.safestring import mark_safe
from django.utils.html import conditional_escape
import re

register = template.Library()

styles = (
	("[i]", "<em>"),
	("[/i]", "</em>"),
	("[b]", "<b>"),
	("[/b]", "</b>"),
	("\n\n", "</p><p>"),
	("\n", "<br />"),
	("[--]", "<ul><li>"),
	("[-]", "</li><li>"),
	("[/-]", "</li></ul>"),
)
#re.findall(r'''\[a href="(http[^"]+)"\]([^"]+)\[/a\]''', s1)

def stylize(value, autoescape=None):
	if autoescape:
		esc = conditional_escape
	else:
		esc = lambda x: x
	
	value = esc(value)
	value = re.sub(r'''\[a url=&quot;(.+)&quot;\](.+)\[/a\]''', r'''<a href="\1">\2</a>''', value)
	
	for style in styles:
		value = value.replace(style[0], style[1])
	
	return mark_safe(value)	
	
	
stylize.needs_autoescape = True
register.filter('style', stylize)

def rss_stylize(value):
	value = re.sub(r'''\[a url=&quot;(.+)&quot;\](.+)\[/a\]''', r'''<a href="\1">\2</a>''', value)
	
	for style in styles:
		value = value.replace(style[0], style[1])
	
	return value
	
	
register.filter('style_rss', rss_stylize)
