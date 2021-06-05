var $form,$catid=new Object(),$validator;
$(function(){
	$catid = $.parseJSON($('#catid').val());
	$form = $(document.newexamen);
	$validator = $( $form ).validate({	//Validador del formulario
		submitHandler: function(form){
			var find=['<','>','!'],remplace=['','',''];
			$('form[name="newexamen"] textarea').each(function(k,v){
				$(v).val($(v).val().replaceArray(find,remplace));
			});
			if($('#txoptico_tl0').val()==0){
				msg('Por favor, de una recomendacion para lentes','warning');
				$('#txoptico_tl0').focus();
				return false
			}
			$.post($(document.newexamen).attr("action"),
				$(document.newexamen).serialize()
			).done(function(data){
				if(typeof data.result != 'undefined' && data.result>0){
					cancelar();
				}
			}).fail(function(e){
				$.noty.closeAll();
				msg(e.status+": "+e.statusText,'error');
			});
			return false;
		}
	});
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		width: 820,
		dialogClass: 'panel panel-default',
		buttons:[
			{
				text:"Cerrar",
                class:"btn btn-default",
                click:function () {
					$(this).dialog( "close" );
                }
            }
		],
		close: function() {
			$.noty.closeAll();
			showMessageSys();
		}
	});
	$("select[id^='txoptico_tl']").change(function(){
		var $input = $(this),
			$num = $input.attr('id').replace('txoptico_tl',''),
			count;
		$('#txoptico_ma'+$num).parent().removeClass("hide");
		$('#txoptico_ma'+$num+' option').remove();
		$('#txoptico'+$num).parent().removeClass("hide");
		$('#txoptico'+$num+' option').remove();
		if(typeof $catid[$(this).val()] != "undefined"){
			count = Object.keys($catid[$(this).val()]);
			if(count.length){
				for(i in count){
					if(typeof count[i] == 'string')
						$('#txoptico_ma'+$num)
						.append($('<option>', { value : count[i] })
						.text(count[i])); 
				}
				count = Object.keys($catid[$(this).val()][$('#txoptico_ma'+$num).val()]);
				if(count.length){
					for(i in count){
						if(typeof count[i] == 'string')
							$('#txoptico'+$num)
								.append($('<option>', { value : count[i] })
								.text(count[i])); 
					}
				}
			} else {
				$('#txoptico_ma'+$num).parent().addClass("hide");
				$('#txoptico_ma'+$num+' option').remove();
				$('#txoptico'+$num).parent().addClass("hide");
				$('#txoptico'+$num+' option').remove();
				msg('No hay categorias, para este tipo de lente','warning');
			}
		} else {
			$('#txoptico_ma'+$num).parent().addClass("hide");
			$('#txoptico_ma'+$num+' option').remove();
			$('#txoptico'+$num).parent().addClass("hide");
			$('#txoptico'+$num+' option').remove();
			if($input.val()!=0)
				msg('Error en el tipo de lente','error');
		}
	});
	$("select[id^='txoptico_ma']").change(function(){
		var $input = $(this),
			$num = $input.attr('id').replace('txoptico_ma',''),
			count;
		$('#txoptico'+$num).parent().removeClass("hide");
		$('#txoptico'+$num+' option').remove();
		if(typeof $catid[$('#txoptico_tl'+$num).val()][$(this).val()] != "undefined"){
			count = Object.keys($catid[$('#txoptico_tl'+$num).val()][$(this).val()]);
			if(count.length){
				for(i in count){
					if(typeof count[i] == 'string')
						$('#txoptico'+$num)
						.append($('<option>', { value : count[i] })
						.text(count[i])); 
				}
			} else {
				$('#txoptico'+$num+' option').remove();
				msg('No hay categorias definidas para este material','warning');
			}
		} else {
			$('#txoptico'+$num+' option').remove();
			msg('Error en los materiales del lentes','error');
		}
	});
	$('input[type=number]').focus(function(){
		var val = parseInt($(this).val());
		if(!val) $(this).val('');
	}).blur(function(){
		var val = $(this).val();
		if(!val.length) $(this).val(0);
	});
	setTimeout(function(){
		clearTimeout($timeout);
	},5000);
	$('#telefono').tooltip();
	$("input[name='d_time']").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd"
	});
	$("input[name='d_test']").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd"
	});
	$("input[name='d_fclod_time']").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd"
	});
	$("input[name='d_fcloi_time']").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "yy-mm-dd"
	});
	$("#birthday").datepicker({
		changeMonth: true,
		changeYear: true,
		yearRange: "-100:+0",
		dateFormat: "yy-mm-dd"
	});
});
function cancelar(){
	document.location.href=base_url + 'optica';
}
function save(){
	if( ($('#txoptico_tl0').val().search(/PROGRESIVO/)!=-1 || $('#txoptico_tl0').val().search(/BIFOCAL/)!=-1) && 
	($('input[name=adiciond]').val() == 0 || $('input[name=adicioni]').val() == 0) ){
		msg('Por favor, escriba la adicion para este tipo de lente','warning');
		$('input[name=adiciond]').focus();
		return false
	}
	confirm('¿Realmente desea <strong>GUARDAR</strong> el examen?',[{
		addClass: 'btn btn-default', 
		text: 'Cancelar', 
		onClick: function($noty) {
			$noty.close();
		}
	},
	{
		addClass: 'btn btn-success', 
		text: 'Confirmar', 
		onClick: function($noty){
			$noty.close();
			$noexit=false;
			$(document.newexamen).submit();
		}
	}]);
}
function historial(){
	var row = $.parseJSON($('#anterior').val()), 
		x = 0, y=0, dsplit='',
		html = "<div class='panel panel-default'>",
		find = Array("keratometriaoi","keratometriaod"),
		replace = Array("Keratometria OI","Keratometria OD");
	$('#accordion').html('');
	$(row).each(function(k,v){
		html += "<div class='panel-heading'role='tab'id='heading"+x+"'><h4 class='panel-title'>";
		if(x)
		html += "<a class='collapsed'data-toggle='collapse'data-parent='#accordion'href='#collapse"+x+"'aria-expanded='false'aria-controls='collapse"+x+"'>";
		else
		html += "<a data-toggle='collapse'data-parent='#accordion'href='#collapse"+x+"'aria-expanded='true'aria-controls='collapse"+x+"'>";
		dsplit = v['date'].split(" ");
		html += $.datepicker.formatDate('dd M yy',new Date(dsplit[0]));
		html += "</a></h4></div>";
		html += "<div id='collapse"+x+"'class='panel-collapse collapse";
		if(!x) html += " in";
		html += "'role='tabpanel'aria-labelledby='heading"+x+"'>";
		html += "<div class='panel-body'><div class='row'>";
		y=4;
		for(var i in v){
			if(i != 'id' && i != 'date' && i != 'idclient' && i != 'status' && i != 'user'){
				html += "<div class='col-xs-4'><label>"+i.replaceArray(find,replace)+"</label>: "+v[i]+"</div>";
				if(y>11){
					html += "</div><div class='row'>";
					y=4;
				} else y+=4;
			}
		}
		html += "</div></div></div>";
		x+=1;
	});
	html += "</div>";
	$('#accordion').html(html);
	$('#dialog-form-new').dialog('open');
}
