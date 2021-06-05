var $form,$b;
$(function(){
	$form = $(document.formNew);
	var	validator = $( $form ).validate({
		invalidHandler:function(event,valid){
			var errors = valid.numberOfInvalids();
			if (errors)
				valid.errorList[0].element.focus();
		},
		submitHandler: function(form){
			var total = 0,
			input = $('#title').html();
			$(form).find('input[type=number]').each(function(i,n){
				if($(n).val().length) total += parseInt($(n).val());
				else $(n).val('0')
			});
			$.post($(form).attr( "action" ),
				$(form).serialize()
			).done(function(data){
				if(typeof data.result != 'undefined' && !isNaN(total))
					$("div.tab-content input[name='"+ input +"']").val(total);
				$("#dialog-form-new").dialog( "close" );
			}).fail(function(){
				showMessageSys();
				$($b.target).html("<span class='glyphicon glyphicon-floppy-disk'></span> Guardar");
			});
			return false;
		},
		showErrors:function(errorMap,errorList){
			$.noty.closeAll();
			$(errorList).each(function(i,n){
				msg(n.message,'warning');
			});
		}
	});
	$($form).find('input[type=number]').focus(function(){
		if($(this).val()=="0")
			$(this).val("");
	}).blur(function(){
		if($(this).val()=="")
			$(this).val("0");
	});
	$("ul.tabs").tabs();
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		width: 520,
		position: 'top',
		open: function(){
			$.noty.closeAll();
			clearTimeout($timeout);
		},
		buttons:[
			{
				html:"<span class='glyphicon glyphicon-ban-circle'></span> Cerrar",
                class:"btn btn-default",
                click:function () {
					$(this).dialog( "close" );
                }
            },
            {
				html:"<span class='glyphicon glyphicon-floppy-disk'></span> Guardar",
				class:"btn btn-success",
                click:function(b){
					$b=b;
					$(b.target).text('Enviando ...');
					$form.submit();
                }
			}
		],
		close:function(){
			if(typeof $b != 'undefined') 
				$($b.target).html("<span class='glyphicon glyphicon-floppy-disk'></span> Guardar");
			document.formNew.reset();
			validator.resetForm();
			$.noty.closeAll();
			showMessageSys();
		}
	});
	$("div.tab-content input[type=text]").click(function(){
		var name = $(this).attr('name'),
			grad = name.split('-'),
			rows, input, item, el,
			filtersdata = {
				groupOp: 'AND',
				rules: [
				    {"field":"i.grad","op":"eq","data":name},
				    {"field":"i.code","op":"bw","data":'MF'}
				]
			};
		$('h3#title').html(name);
		$('input#grad').val(name);
		if(grad.length>2) grad.remove(0).clean();
		if(grad.length){
			grad[0]=grad[0].replace("+","").replace("-","");
			grad[0]=parseFloat(grad[0]);
			grad[1]=parseFloat(grad[1]);
		}
		$.post(base_url + "catalogos/jsonStoreLot",{
			_search:'true',
			searchField:'i.grad',
			searchOper:'eq',
			searchString:name,
			filters:JSON.stringify(filtersdata),
			csrf_omadero:$.cookie('csrf_omadero')
		}).done(function(data){
			console.log(data);
			if(data.records)
				rows = data.rows;
			$("form[name='formNew'] input[type='number']").each(function(i,n){
				$(n).parents('div.form-group').show();
				input = $(n).attr('id');
				el = $('#name-'+input).text();
				if((grad[0]>2.75 || grad[1]>2.75) && el=="PLASTICO"){
					$(n).parents('div.form-group').hide();
				}
				if((grad[0]<3 && grad[1]<3) && el=="HIINDEX"){
					$(n).parents('div.form-group').hide();
				}
				if(data.records)
					if(typeof rows[input] != "undefined")
						$(n).val(rows[input].cell.amount);
				if(!$(n).val().length) $(n).val('0');
			});
			$('#dialog-form-new').removeClass('hide');
			$('#dialog-form-new').dialog('open');
		});
	});
});
