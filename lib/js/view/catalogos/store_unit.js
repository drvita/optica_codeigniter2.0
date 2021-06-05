var $form,$b;
$(function(){
	$form = $(document.formNew);
	var validator = $($form).validate({
		invalidHandler:function(event,valid){
			var errors = valid.numberOfInvalids();
			if (errors)
				valid.errorList[0].element.focus();
		},
		submitHandler: function(form){
			$.post($(form).attr("action"),
				$(form).serialize()
			).done(function(data){
				if(typeof data.result != 'undefined'){
					$("#dialog-form-new").dialog("close");
					$('#gridstore').trigger('reloadGrid');
				}
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
	$("#gridstore").jqGrid({
		url: base_url + 'catalogos/jsonStoreUnit',
		editurl: base_url + 'catalogos/saveStoreUnit',
		colNames:['Unidades'], 
		colModel:[ 
			{name:'name',index:'name',sorttype:"string"}
		],
		sortname:'name',
		caption:"Listado de unidades de medición"
	});
	$("#gridstore").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridstore").jqGrid('setGridWidth', $("#content").width()-20, true);
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		position: 'top',
		open: function(){
			$.noty.closeAll();
			clearTimeout($timeout);
		},
		buttons:[
			{
				html:"<span class='glyphicon glyphicon-ban-circle'></span> Cerrar",
                class:"btn btn-default",
                click:function(){
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
		close: function() {
			if(typeof $b != 'undefined') 
				$($b.target).html("<span class='glyphicon glyphicon-floppy-disk'></span> Guardar");
			document.formNew.reset();
			$(document.formNew.oper).val('add');
			$(document.formNew.id).val(0);
			validator.resetForm();
			$.noty.closeAll();
			showMessageSys();
		}
	});
});
function add(){
	$('#dialog-form-new').removeClass('hide');
	$('#dialog-form-new').dialog('open');
}
function edit(){
	var rowid = $("#gridstore").jqGrid('getGridParam','selrow'),
		rowData;
	if( rowid != null ){
		rowData = $("#gridstore").getRowData(rowid);
		document.formNew.name.value = rowData.name;
		document.formNew.id.value = rowData.name;
		document.formNew.oper.value = 'edit';
		add();
	} else msg("Selecciona una categoria para editar","warning");
}
function eliminar(){
	var rowid = $("#gridstore").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$("#gridstore").jqGrid('delGridRow',rowid,{reloadAfterSubmit:true,closeOnEscape:true,closeAfterDelete:true,
		afterShowForm:function(form_id) {
			var thisForm = form_id.selector.replace('DelTbl_','delmod');
			var dialogHeight = $(thisForm).height();
			var dialogWidth = $(thisForm).width();
			var windowHeight = $(window).height();
			var windowWidth = $(window).width();
			$(thisForm).css('position','fixed');
			$(thisForm).css('top',(windowHeight-dialogHeight)/2);
			$(thisForm).css('left',(windowWidth-dialogWidth)/2);
		},afterSubmit:function(response,postdata){
			showMessageSys();
			return [true];
		},
		onclickSubmit: function(params){
            return {csrf_omadero:$.cookie('csrf_omadero')};
        }});
	} else msg("Selecciona una categoria","warning");
}
