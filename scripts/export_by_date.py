
import json
from dateutil.parser import parse
from datetime import datetime

target_day = datetime(2013, 1, 8, 12)

count = 0
with open('../data/2013_filtered_by_date_{}.geo.json'.format(target_day.strftime('%Y_%m_%d_%H')), 'w') as outfile:
    with open('../data/ship_lines_2013.json', 'r') as infile:
        for line in infile:
            if count == 0:
                outfile.write('{"type": "FeatureCollection", "features": [\n')
            if count > 1:
                outfile.write(',\n')
            data = {}
            try:
                data = json.loads(line)
            except ValueError:
                continue
            start = parse(data['properties']['trackStartTime'])
            end = parse(data['properties']['trackEndTime'])
            if start < target_day and end > target_day:
                outfile.write(line.strip())
    outfile.write(']}')
