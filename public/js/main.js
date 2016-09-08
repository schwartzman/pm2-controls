$('button').click(function(){
	$('#output').text('working...')
})

$('button.stop').click(function(){
	$('#output').load('/stop/'+$(this).attr('rel'))
})

$('button.restart').click(function(){
	$('#output').load('/restart/'+$(this).attr('rel'))
})
