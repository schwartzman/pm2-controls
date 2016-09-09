function modName(context){
	return $(context).parent().data('module')
}

$('button').click(function(){
	$('#output').text('working...')
})

$('button.stop').click(function(){
	$('#output').load('/stop/' + modName(this))
})

$('button.restart').click(function(){
	$('#output').load('/restart/' + modName(this))
})
