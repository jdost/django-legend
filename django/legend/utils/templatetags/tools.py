from django import template
import legend.settings as s

register = template.Library()


@register.simple_tag
def script(args):
    '''
script:
    Simple template tag, just takes a path array* and creates the script tag
    for the HTML.

        * The path array is just an array with each element being a level of
          the path (so ['a', 'path', 'to', 'this'] becomes a/path/to/this)
    '''
    path = [s.STATIC_URL, "js"] + args
    return "<script type=\"text/javascript\" " + \
        "src=\"{0}\" ></script>".format("/".join(path))


@register.simple_tag
def style(args):
    '''
style:
    Simple template tag, just takes a path array* and creates a link tag to
    the style sheet.  If the page is in DEBUG mode, it will be to the LESS
    version, otherwise the static CSS version.

        * The path array is just an array with each element being a level of
          the path (so ['a', 'path', 'to', 'this'] becomes a/path/to/this)
    '''
    if s.DEBUG:
        path = [s.STATIC_URL, "less"] + args
        return "<link rel=\"stylesheet/less\" type=\"text/css\" " + \
            "href=\"{0}.less\">".format("/".join(path))
    else:
        path = [s.STATIC_URL, "css"] + args
        return "<link rel=\"stylesheet\" type=\"text/css\" " + \
            "href=\"{0}.css\">".format("/".join(path))
