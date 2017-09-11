import json

from dateutil import parser
from datetime import datetime as dt

hours = []
min_time = dt.now()
max_time = dt.fromtimestamp(0)

input_file = './data/ship_lines_2011.json'

coords = []

with open(input_file, 'r') as infile:
    for line in infile:
        data = json.loads(line)
        prop = data['properties']
        coords.append(len(data['geometry']['coordinates'][0]))
        start = parser.parse(prop['trackStartTime'])
        end = parser.parse(prop['trackEndTime'])
        sec_diff = (start - end).seconds
        hour_diff = sec_diff / 3600
        hours.append(hour_diff)
        if start < min_time:
            min_time = start
        if end > max_time:
            max_time = end

print('Start: {} End: {}'.format(min_time, max_time))
print('Average hours: {} {} {}'.format(len(hours), sum(hours), sum(hours) / len(hours)))
print('Average coordinates: {} {}', len(coords), sum(coords) / len(coords))
