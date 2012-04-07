from django import template
import legend.settings as s

register = template.Library()


@register.simple_tag
def script(args):
    path = [s.STATIC_URL, "js"] + args
    return "<script type=\"text/javascript\" " + \
        "src=\"{0}\" ></script>".format("/".join(path))


@register.simple_tag
def style(args):
    if s.DEBUG:
        path = [s.STATIC_URL, "less"] + args
        return "<link rel=\"stylesheet/less\" type=\"text/css\" " + \
            "href=\"{0}.less\">".format("/".join(path))
    else:
        path = [s.STATIC_URL, "css"] + args
        return "<link rel=\"stylesheet\" type=\"text/css\" " + \
            "href=\"{0}.css\">".format("/".join(path))
