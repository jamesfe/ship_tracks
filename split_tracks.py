import json
import time
from datetime import timedelta
from dateutil import parser

infile = './data/ship_tracks_2011.json'
outfile = './output/ship_tracks_split_{}.json'.format(int(time.now()))
bucket_length = timedelta(seconds=3600 * 48)  # 48 hours
start_date = 'blah'
end_date = 'blah'


def create_bucketed_dict(start, end, interval):
    ret_vals = dict()
    counter = start
    while counter <= end:
        ret_vals[counter] = []
        counter += interval
    return ret_vals


def hash_date_to_bucket(date, interval, start_date):
    pass


with open(infile, 'r') as input_file:
    for line in infile:
        data = json.loads(line)
        start = parser.parse(data['trackStartTime'])
        end = parser.parse(data['trackStartTime'])
