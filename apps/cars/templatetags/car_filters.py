from django import template

register = template.Library()

@register.filter
def format_price(value):
    """Format a number with commas as thousand separators"""
    try:
        return "{:,.0f}".format(float(value))
    except (ValueError, TypeError):
        return value

@register.filter
def phone_number_format(value):
    """Format a phone number in a readable way"""
    if not value:
        return ""
    
    # Remove any non-digit characters
    number = ''.join(filter(str.isdigit, str(value)))
    
    # Format Pakistani phone numbers (expected format: 03XX-XXXXXXX)
    if len(number) == 11 and number.startswith('03'):
        return f"{number[:4]}-{number[4:]}"
    
    # Format landline numbers (expected format: 0XX-XXXXXXX)
    elif len(number) == 10 and number.startswith('0'):
        return f"{number[:3]}-{number[3:]}"
    
    return value
