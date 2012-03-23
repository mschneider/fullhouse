$ ->
	$('#box').mousemove((e) -> 
		$('#info').html(e.offsetX + ', ' + e.offsetY);
	)
