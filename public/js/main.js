function route(context) {
	var endpoint = $(context).data('action')
	var param = $(context).parent().data('module')
	return '/' + endpoint + '/' + param
}

$('.action').click(function(){
	$('#output').text('working...')
})

$('button, .button').click(function() {
	$('#output').load(route(this))
})

$('h1').click(function() {
	$('#output').html('<a href="https://en.wikipedia.org/wiki/Asgard" target="_blank">Further reading for the inquisitive</a>')
})
