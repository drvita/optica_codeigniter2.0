$(function(){
	$('#inicio').submit(function(){
		var efectivo = parseInt($('#inCash').val());
		if(efectivo<=0){
			msg('A tecleado un valor invalido','warning');
			$('#inCash').focus()
			return false;
		}
		$.post($(this).attr('action'),
			$(this).serialize()
		).done(function(data){
			if(data.result) $('#infooter').addClass("hide");
			$.noty.closeAll();
			showMessageSys();
		});
		return false;
	});
	$('#corte').submit(function(){
		if(parseInt($("input[name='tarjetas']").val())==0 && parseInt($("input[name='compras']").val())==0 && parseInt($("#offCash").val())==0){
			msg('Escribio valores en CERO en todos los campos del corte','warning');
			$("#offCash").focus()
			return false;
		}
		$.post($(this).attr('action'),
			$(this).serialize()
		).done(function(data){
			if(data.result && parseInt($("input[name='tarjetas']").val())>0 && 
				parseInt($("input[name='compras']").val())>0 && parseInt($("#offCash").val())>0) $('#infooter').addClass("hide");
			$.noty.closeAll();
			showMessageSys();
		});
		return false;
	});
	$("input[name^='num']").change(function(){
		var val = parseInt($(this).val()),
			name = $(this).attr('name'),
			mul = parseInt(name.replace('num','')),
			suma=0;
		$("input[name='res"+mul+"']").val(val*mul);
		$("input[name^='res']").each(function(){
			var val = parseInt($(this).val());
			suma += val;
		});
		$("#offcash").val(suma);
	});
	$("input[name='res0']").change(function(){
		var suma = 0;
		$("input[name^='res']").each(function(){
			var val = parseInt($(this).val());
			suma += val;
		});
		$("#offcash").val(suma);
	});
});
