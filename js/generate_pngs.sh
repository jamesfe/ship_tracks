#!/bin/bash
for i in `seq 1 365`;
do
	node ./src/node_render.js $i
done
