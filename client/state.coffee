# A state of a player
class PlayerState
  
  constructor : (x, y, active) ->
    if typeof x == "object"
      @active = x.active
      @x = x.x
      @y = x.y
    else
      @active = active | false
      @x = x | 0
      @y = y | 0
    
  equals : (otherPlayerState) ->
    otherPlayerState? && otherPlayerState.x is @x && otherPlayerState.y is @y && otherPlayerState.active == @active
    
  setPosition : (x, y) ->
    @x = x
    @y = y
    
  setActive : (active) ->
    @active = active
    
  copy : ->
    new PlayerState(@x, @y, @active)
    
  values : ->
    {x: @x, y: @y, active: @active}
    
