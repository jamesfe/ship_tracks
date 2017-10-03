var assert = require('assert');

var seg = require('../segmentSplitter');

describe('getSplitPoint tests', function() {

  describe('easy tests', function() {
    it('should calculate the whole segment for a full distance', function() {
      const val = seg.getSplitPoint([0, 0], [0, 1], 1)
      assert.equal(val, [0, 1]);
    });

 });

});
