from django import template

register = template.Library()

def formatComm(value):
	if int(value) == 0:
		return "00"
	elif int(value) < 10:
		return "0" + str(value)
	else:
		return str(value)
		
register.filter('clean_count', formatComm)
