
import json
import datetime as dt

from dateutil import parser

start_dt = dt.datetime(2011, 1, 1)
start_julian = start_dt.timetuple().tm_yday

end_dt = dt.datetime(2011, 12, 31)
end_julian = end_dt.timetuple().tm_yday

print('From {} to {}'.format(start_julian, end_julian))

julian_files = [open('./daily/misc.json', 'w')]

for k in range(1, end_julian + 1):
    julian_files.append(open('./daily/{}.json'.format(k), 'w'))

with open('./data/ship_data_by_line.json', 'r') as infile:
    for line in infile:
        data = json.loads(line)
        prop = data['properties']
        start = parser.parse(prop['trackStartTime'])
        jday = start.timetuple().tm_yday
        try:
            julian_files[jday].write(json.dumps(line) + '\n')
        except:
            print('Failed on index: ', jday)

for item in julian_files:
    item.close()
