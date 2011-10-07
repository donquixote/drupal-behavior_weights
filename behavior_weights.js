(function(){

  function sortDrupalBehaviors() {
    var weights = {};
    for (var k in Drupal.behaviors) {
      var v = Drupal.behaviors[k];
      var pieces = k.split('.');
      if (pieces.length == 2 && pieces[1] === 'weight') {
        weights[pieces[0]] = v;
        delete Drupal.behaviors[k];
      }
      else {
        if (weights[k] == undefined) {
          weights[k] = 0;
        }
      }
    }

    var ww = [0];
    var by_weight = {0: {}};
    for (var k in weights) {
      var w = weights[k];
      if (by_weight[w] == undefined) {
        by_weight[w] = {};
        ww.push(w);
      }
      by_weight[w][k] = Drupal.behaviors[k];
    }
    ww.sort(function(a,b){return a - b;});

    // Other scripts that want to mess with behaviors, will only see those with weight = 0.
    Drupal.behaviors = by_weight[0];

    var sorted = [];
    for (var i = 0; i < ww.length; ++i) {
      var w = ww[i];
      sorted.push(by_weight[w]);
    }
    return sorted;
  }

  var attachBehaviors_original = Drupal.attachBehaviors;

  Drupal.attachBehaviors = function(context, settings) {
    if (Drupal.jsEnabled) {
      var sorted = sortDrupalBehaviors();
      Drupal.attachBehaviors = function(context, settings) {
        context = context || document;
        if (Drupal.jsEnabled) {
          // Execute all of them.
          for (var i = 0; i < sorted.length; ++i) {
            jQuery.each(sorted[i], function() {
              this(context);
            });
          }
        }
      }
      Drupal.attachBehaviors.apply(this, [context, settings]);
    }
  };
})();

