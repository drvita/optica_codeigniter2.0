$(function(){
	$("#tabs").tabs();
	$( "#calle" ).autocomplete({
		source:function(request,response){
			$.get("http://maps.googleapis.com/maps/api/geocode/json",{
				address: request.term,
				country: 'Mexico',
				sensor: "true"
			}).done(function(data){
				if(!data.status=="OK") return false;
				var map = new Array();
				$(data.results).each(function(k,v){
					map[k] = new Object();
					map[k].label = data.results[k].formatted_address;
					$(data.results[k].address_components).each(function(s,b){
						if(data.results[k].address_components[s].types[0]=="route")
							map[k].value = changetoutf8(data.results[k].address_components[s].long_name).toUpperCase();
					});
					map[k].row = data.results[k].address_components;
					if(k==10) return false;
				});
				response( map );
			}).fail(function(e){
				$.noty.closeAll();
				msg(e.status+": "+e.statusText,'error');
			});
		},
		minLength: 3,
		select:function(event,ui){
			var form = $("form[name='formNew'] input[name ^= domicilio]").val("");
			$(ui.item.row).each(function(p,v){
				if(ui.item.row[p].types[0]=="street_number")
					$('#noExterior').val(ui.item.row[p].long_name.toUpperCase());
				else if(ui.item.row[p].types[0]=="neighborhood")
					$('#colonia').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="administrative_area_level_2")
					$('#municipio').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="administrative_area_level_1")
					$('#estado').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="country")
					$('#pais').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="postal_code")
					$('#CodigoPostal').val(parseInt(ui.item.row[p].long_name));
			});
		}
	});
	$("input[name='file_cer']").change(function(){
		var val = $(this).val();
		if (!val.match(/(?:cer)$/)) {
			msg('El archivo no es un certificado valido','error');
			$(this).val('');
		}
	});
	$("input[name='file_key']").change(function(){
		var val = $(this).val();
		if (!val.match(/(?:key)$/)) {
			msg('El archivo no es un llave publica','error');
			$(this).val('');
		}
	});
});
function save(){
	if($("input[name='file_cer']").val().length || $("input[name='file_cer']").val().length){
		$("#form-setting").attr("enctype","multipart/form-data");
	}else{
		$("#form-setting").attr("enctype","");
	}
	$("#form-setting").submit();
}
function copyDom(){
	var $arraydf = $("input[name^='emisor[DomicilioFiscal]']");
	for (var e in $arraydf) {
		var valor = parseInt(e); 
		if (!isNaN(valor)){
			var $elemdf = $arraydf[valor];
			var $namedf = $elemdf.name.split('emisor[DomicilioFiscal]');
			var $namexp="emisor[ExpedidoEn]"+$namedf[1];
			var $elemxp = $("input[name='"+$namexp+"']");
			$elemxp.val($elemdf.value);
		}
	}
}
