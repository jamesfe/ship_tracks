import json

from dateutil import parser
from datetime import datetime as dt

hours = []
min_time = dt.now()
max_time = dt.fromtimestamp(0)

with open('./stupid.json', 'r') as infile:
    for line in infile:
        data = json.loads(line)[1]
        prop = data['properties']
        start = parser.parse(prop['trackStartTime'])
        end = parser.parse(prop['trackEndTime'])
        sec_diff = (start - end).seconds
        hour_diff = sec_diff / 3600
        hours.append(hour_diff)
        if start < min_time:
            min_time = start
        if end > max_time:
            max_time = end
        # print('{}  {} {}'.format(start, end, hour_diff))

print('Start: {} End: {}'.format(min_time, max_time))
print('Average hours: {} {} {}'.format(len(hours), sum(hours), sum(hours) / len(hours)))
