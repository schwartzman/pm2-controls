function route(context) {
	var result = $(context).data('action')
	var param = $(context).parent().data('module')
	if (param) {
		result += '/' + param
	}
	return '/' + result
}

$('[data-action]').click(function(){
	$('#output').text('working...')
})

$('[data-action]').click(function() {
	$('#output').load(route(this))
})
