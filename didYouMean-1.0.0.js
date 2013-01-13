/*
  didYouMean
  ==========

  [Available on GitHub](https://github.com/dcporter/didyoumean.js).

  A super-simple, not-terribly-optimized JS library for matching short, typo-ridden input to a list of possibilities.
  It computes edit distance using a Levenshtein distance algorithm from wikibooks:

  http://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Levenshtein_distance#JavaScript


  didYouMean(str, list, [key])
  ----------------------------

  - str: The string input to match.
  - list: An array of strings or objects to match against.
  - key (OPTIONAL): If your list array contains objects, you must specify the key which contains the string
    to match against.

  Returns: the closest matching string, or null if no strings exceed the threshold.


  Option(s)
  ---------

  Options are set on the didYouMean function object. You may change them at any time.

  ### threshold

    By default, the method will only return strings whose edit distance is less than 40% (0.4x) of their length.
    For example, if a ten-letter string is five edits away from its nearest match, the method will return false.

    You can control this by setting the "threshold" value on the didYouMean function. For example, to set the
    edit distance threshold to 50% of the input string's length:

    ```
    didYouMean.threshold = 0.5;
    ```

    To return the nearest match no matter the threshold, set this value to null.

  ### caseSensitive

    By default, the method will perform case-insensitive comparisons. If you wish to force case sensitivity, set
    the "caseSensitive" value to true:

    ```
    didYouMean.caseSensitive = true;
    ```
  
  ### nullResultValue

    By default, the method will return null if there is no sufficiently close match. You can change this value here.

  ### returnWinningObject

    By default, the method will return the winning string value (if any). If your list contains objects rather
    than strings, you may set returnWinningObject to true.
    
    ```
    didYouMean.returnWinningObject = true;
    ```
    
    This option has no effect on lists of strings.


  Examples
  --------

  Matching against a list of strings:
  ```
  var input = 'insargrm'
  var list = ['resume', 'twitter', 'instagram', 'linkedin'];
  console.log(didYouMean(input, list));
  > 'instagram'
  // The method matches 'insargrm' to 'instagram'.

  input = 'google plus';
  console.log(didYouMean(input, list));
  > false
  // The method is unable to match 'google plus' to any of a list of useful social networks.
  ```

  Matching against a list of objects:
  ```
  var input = 'insargrm';
  var list = [ { id: 'resume' }, { id: 'twitter' }, { id: 'instagram' }, { id: 'linkedin' } ];
  var key = 'id';
  console.log(didYouMean(input, list, key));
  > 'instagram'
  // The method returns the matching value.

  didYouMean.returnWinningObject = true;
  console.log(didYouMean(input, list, key));
  > { id: 'instagram' }
  // The method returns the matching object.
  ```


  TODO
  ----

  This is missing a major optimization that I don't understand how to implement. Since we only ever care about
  edit distances that are smaller than the current winner, we can stop searching as soon we exceed that limit for
  any given possible match.


  License
  -------

  Portions of this code are licensed from WikiBooks under the terms of the GNU Free Document License. You may obtain
  a copy of the GNU Free Document License [here](http://en.wikibooks.org/wiki/GNU_Free_Documentation_License).
  
  The portion of original work not covered by the GNU FDL is released under the terms of the Apache License.  You
  may obtain a copy of the Apache License [here](http://www.apache.org/licenses/LICENSE-2.0). A fuller licensing
  document may be found [here](http://github.com/dcporter/didyoumean.js).

  (I'm not a lawyer, I don't know how these two licenses interact, but if they do then the result should be more,
  rather than less, permissive.)

*/
var didYouMean = (function() {

  // The didYouMean method.
  var ret = function(str, list, key) {
    if (!str) return false;

    // If we're running a case-insensitive search, smallify str.
    if (!arguments.callee.caseSensitive) { str = str.toLowerCase(); }

    // Get the edit distance to each option. If the closest one is less than 40% (by default) of str's length,
    // then return it.
    var winner,
        threshold = arguments.callee.threshold,
        winningVal = threshold === null ? null : threshold * str.length,
        candidate, val,
        i, len = list.length;
    for (i = 0; i < len; i++) {
      // Get item.
      candidate = list[i];
      // If there's a key, get the candidate value out of the object.
      if (key) candidate = candidate[key];
      // Gatekeep.
      if (!candidate) continue;
      // If we're running a case-insensitive search, smallify the candidate.
      if (!arguments.callee.caseSensitive) { candidate = candidate.toLowerCase(); }
      // Get and compare edit distance.
      val = getEditDistance(str, candidate);
      // If this value is smaller than our current winning value, OR if we have no winning val yet (i.e. the
      // threshold option is set to null, meaning the caller wants a match back no matter how bad it is), then
      // this is our new winner.
      if (winningVal === null || val < winningVal) {
        winningVal = val;
        // Set the winner to either the value or its object, depending on the returnWinningObject option.
        if (key && arguments.callee.returnWinningObject) winner = list[i];
        else winner = candidate;
      }
    }

    // If we have a winner, return it.
    return winner || argument.callee.nullResultValue;
  };

  // Set default options.
  ret.threshold = 0.4;
  ret.caseSensitive = false;
  ret.nullResultValue = null;
  ret.returnWinningObject = null;

  // Release the hounds. From the enclosure.
  return ret;
  // The enCLOSURE. Get it?

  // Algorithm courtesy of http://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Levenshtein_distance#JavaScript
  // TODO: Optimize this to quit searching after the current winning value is exceeded.
  function getEditDistance(a, b){
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 

    var matrix = [];

    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                  Math.min(matrix[i][j-1] + 1, // insertion
                                           matrix[i-1][j] + 1)); // deletion
        }
      }
    }

    return matrix[b.length][a.length];
  };

})();
