
import json
import datetime as dt

from dateutil import parser

# Possible bug: What if the year is not 2011??
start_dt = dt.datetime(2011, 1, 1)
start_julian = start_dt.timetuple().tm_yday

end_dt = dt.datetime(2011, 12, 31)
end_julian = end_dt.timetuple().tm_yday

print('From {} to {}'.format(start_julian, end_julian))


def return_good_path(val):
    return './js/public/assets/data/daily/{}.json'.format(val)


julian_files = [open(return_good_path('misc'), 'w')]

for k in range(1, end_julian + 1):
    julian_files.append(open(return_good_path(k), 'w'))
    julian_files[k].write('[\n')

lines_written = [0] * len(julian_files)

with open('./data/ship_data_by_line.json', 'r') as infile:
    for line in infile:
        data = json.loads(line)
        prop = data['properties']
        start = parser.parse(prop['trackStartTime'])
        jday = start.timetuple().tm_yday
        try:
            if lines_written[jday] == 0:
                julian_files[jday].write(line.strip())
            else:
                julian_files[jday].write(',\n' + line.strip())
            lines_written[jday] += 1
        except:
            print('Failed on index: ', jday)

for item in julian_files:
    item.write(']')
    item.close()


for index, item in enumerate(lines_written):
    print('{} {}'.format(index, item))
