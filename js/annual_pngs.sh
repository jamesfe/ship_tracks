#!/bin/bash
for i in `seq 1 365`;
do
	printf $i" "
	node ./node_render.js $i
done

# Make it
# convert -delay 10 -loop 0 @../output/2013/file.order ../output/*.png animated.gif
# http://www.imagemagick.org/discourse-server/viewtopic.php?t=28672
