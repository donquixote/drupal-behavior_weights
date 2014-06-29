(function(){

  Drupal.behavior_weights = {};

  /**
   * @param {Object<{}|number>} behaviors
   *   The Drupal.behaviors object. This object will be modified.
   *   The object may contain weight settings of two types:
   *   behaviors['xyz.weight'] = 5;
   *   behaviors.xyz.weight = 5;
   *   The former has priority.
   * @returns {Object<number>}
   */
  Drupal.behavior_weights.extractExternalWeights = function(behaviors) {
    var weights = {};
    for (var k in behaviors) {
      var v = behaviors[k];
      // Look for weight settings like behaviors['xyz.weight'] = 5.
      var pieces = k.split('.');
      if (pieces.length == 2 && pieces[1] === 'weight') {
        // This v is not a behavior, but a weight setting for another behavior.
        weights[pieces[0]] = v;
        delete behaviors[k];
      }
    }
    return weights;
  };


  /**
   * @param {Object<{}|number>} behaviors
   *   The Drupal.behaviors object. This object will be modified.
   *   The object may contain weight settings of two types:
   *   behaviors['xyz.weight'] = 5;
   *   behaviors.xyz.weight = 5;
   *   The former has priority.
   * @returns {Object<number>}
   */
  Drupal.behavior_weights.extractWeights = function(behaviors) {
    var weights = Drupal.behavior_weights.extractExternalWeights(behaviors);
    for (var k in behaviors) {
      var v = behaviors[k];
      if (typeof v !== 'object') {
        // Do nothing.
        continue;
      }
      if (typeof weights[k] === 'number') {
        // Weight already exists.
        continue;
      }
      // This v is a behavior object, but it might contain a weight setting.
      if (typeof v === 'object' && v && typeof v.weight === 'number') {
        weights[k] = v.weight;
      }
    }
    return weights;
  };

  /**
   * @param {Object<number>} weights
   * @param {Object<{}|number>} behaviors
   */
  Drupal.behavior_weights.updateWeights = function(weights, behaviors) {
    var newWeights = Drupal.behavior_weights.extractWeights(behaviors);
    for (var k in newWeights) {
      weights[k] = newWeights[k];
    }
  };

  /**
   * @param {Object<{}|number>} behaviors
   *   The Drupal.behaviors object.
   * @param {Object<number|false>} weights
   *   The weights.
   *
   * @returns {Array<string>}
   *   The sorted behavior keys.
   */
  Drupal.behavior_weights.extractKeysSorted = function(behaviors, weights) {
    var originalPosition = {};
    var keysToSort = [];
    var incrementOrder = 0;
    for (var k in behaviors) {
      originalPosition[k] = incrementOrder++;
      keysToSort.push(k);
    }
    keysToSort.sort(function(k0, k1) {
      var w0 = (weights[k0] !== undefined) ? weights[k0] : 0;
      var w1 = (weights[k1] !== undefined) ? weights[k1] : 0;
      if (w0 !== w1) {
        return w0 - w1;
      }
      return originalPosition[k0] - originalPosition[k1];
    });
    return keysToSort;
  };

  /**
   * @param {Object<{}|number>} behaviors
   *   The Drupal.behaviors object.
   * @param {Object<number|false>} weights
   *   The weights.
   *
   * @returns {Array<{}>}
   *   The sorted behavior objects.
   */
  Drupal.behavior_weights.extractBehaviorsSorted = function(behaviors, weights) {
    var keysSorted = Drupal.behavior_weights.extractKeysSorted(behaviors, weights);
    var behaviorsSorted = [];
    for (var i = 0; i < keysSorted.length; ++i) {
      var k = keysSorted[i];
      if (behaviors[k] && typeof behaviors[k] === 'object') {
        behaviorsSorted.push(behaviors[k]);
      }
    }
    return behaviorsSorted;
  };

  /**
   * @constructor
   */
  Drupal.behavior_weights.BehaviorOrder = function(behaviors) {

    /**
     * @type {Object<number>}
     */
    var weights = {};

    /**
     * @returns {Object.<number>}
     */
    this.extractWeights = function() {
      Drupal.behavior_weights.updateWeights(weights, behaviors);
      return weights;
    };

    /**
     * Update, and extract the latest order of behavior keys.
     * This is mostly for testing purposes.
     *
     * @returns {Array<string>}
     *   A sorted array of behavior objects.
     */
    this.extractSortedKeys = function() {
      Drupal.behavior_weights.updateWeights(weights, behaviors);
      return Drupal.behavior_weights.extractKeysSorted(behaviors, weights);
    };

    /**
     * Update, and extract the latest behavior order.
     *
     * @returns {Array<{}>}
     *   A sorted array of behavior objects.
     */
    this.extractSortedBehaviors = function() {
      Drupal.behavior_weights.updateWeights(weights, behaviors);
      return Drupal.behavior_weights.extractBehaviorsSorted(behaviors, weights);
    };
  };

  /**
   * Encapulates weight information extracted from Drupal.behaviors.
   *
   * @type {Drupal.behavior_weights.BehaviorOrder}
   */
  var behaviorOrder = new Drupal.behavior_weights.BehaviorOrder(Drupal.behaviors);

  /**
   * The original Drupal.attachBehaviors function. Not really used.
   *
   * @type {function}
   */
  var attachBehaviors_original = Drupal.attachBehaviors;

  /**
   * Replacement implementation for Drupal.attachBehaviors.
   *
   * @param {{}} context
   * @param {{}} settings
   */
  Drupal.attachBehaviors = function(context, settings) {
    context = context || document;
    settings = settings || Drupal.settings;
    var sorted = behaviorOrder.extractSortedBehaviors();
    // Execute all of them.
    for (var i = 0; i < sorted.length; ++i) {
      jQuery.each(sorted[i], function() {
        if (typeof this.attach === 'function') {
          this.attach(context, settings);
        }
      });
    }
  };

})();

