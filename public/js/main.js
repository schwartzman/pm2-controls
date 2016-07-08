$('button').click(function(){
	$('#output').text('working...')
})

$('button.stop').click(function(){
	$('#output').load('/stop')
})

$('button.restart').click(function(){
	$('#output').load('/restart')
})
