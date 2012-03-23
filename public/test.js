(function() {

  $(function() {
    return $('#box').mousemove(function(e) {
      return $('#info').html(e.offsetX + ', ' + e.offsetY);
    });
  });

}).call(this);
