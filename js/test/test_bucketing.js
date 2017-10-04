var assert = require('assert');

var seg = require('../segmentSplitter');

function withinRange(inVal, expected, distance) {
  const diff = Math.abs(inVal - expected);
  if (diff < distance) {
    return true;
  }
  console.log(`Input: ${inVal} Expected: ${expected}`);
  console.log(`${diff} larger than ${distance}`);
  return false;
}

describe('getSplitPoint tests', function() {

  describe('easy tests', function() {
    it('should calculate the whole segment for a full distance', function() {
      const val = seg.getSplitPoint([0, 0], [0, 1], 1)
      assert(withinRange(val[0], 0, 0.001));
      assert(withinRange(val[1], 1, 0.001));
    });
 });

});
