

def convert_datetime_to_isoformat(dict_obj, values):
    if not dict_obj: return
    for value in values:
        if dict_obj.get(value):
            dict_obj[value] = dict_obj[value].isoformat()