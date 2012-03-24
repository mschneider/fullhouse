var PlayerState;

PlayerState = (function() {

  function PlayerState(x, y, active) {
    if (typeof x === "object") {
      this.active = x.active;
      this.x = x.x;
      this.y = x.y;
    } else {
      this.active = active | false;
      this.x = x | 0;
      this.y = y | 0;
    }
  }

  PlayerState.prototype.equals = function(otherPlayerState) {
    return (otherPlayerState != null) && otherPlayerState.x === this.x && otherPlayerState.y === this.y && otherPlayerState.active === this.active;
  };

  PlayerState.prototype.setPosition = function(x, y) {
    this.x = x;
    return this.y = y;
  };

  PlayerState.prototype.setActive = function(active) {
    return this.active = active;
  };

  PlayerState.prototype.copy = function() {
    return new PlayerState(this.x, this.y, this.active);
  };

  PlayerState.prototype.values = function() {
    return {
      x: this.x,
      y: this.y,
      active: this.active
    };
  };

  return PlayerState;

})();
