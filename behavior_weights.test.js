/**
 * @file
 * This file is for copy + paste into the Firebug or Chromium console.
 */

(function(){

  var d = Drupal.behavior_weights;

  Drupal.behaviors['xyz.weight'] = 5;
  Drupal.behaviors['muh.weight'] = 3;

  Drupal.behaviors.xyz = {
    attach: function () {}
  };

  Drupal.behaviors.muh = {
    attach: function () {}
  };

  /**
   * Encapulates weight information extracted from Drupal.behaviors.
   *
   * @type {Drupal.behavior_weights.BehaviorOrder}
   */
  var behaviorOrder = new Drupal.behavior_weights.BehaviorOrder(Drupal.behaviors);

  console.log(behaviorOrder.extractWeights());
  console.log(behaviorOrder.extractSortedKeys());

  Drupal.behaviors['foobar.weight'] = -10;
  Drupal.behaviors['muh.weight'] = 7;

  Drupal.behaviors.foobar = {
    attach: function() {}
  };

  console.log(behaviorOrder.extractWeights());
  console.log(behaviorOrder.extractSortedKeys());


})();
