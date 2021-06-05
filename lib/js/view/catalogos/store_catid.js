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
			$.post($(form).attr( "action" ),$(form).serialize()).done(function(data){
				if(typeof data.result != 'undefined'){
					$("#dialog-form-new").dialog("close");
					$('#gridCatid').trigger('reloadGrid');
				} else {
					showMessageSys();
					clearTimeout($timeout);
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
	$("#gridCatid").jqGrid({
		url: base_url + 'catalogos/jsonCatid',
		editurl: base_url + 'catalogos/saveCatid',
		colNames:['ID','Padre','Nombre','Codigo','Precio base','padre','idpn'], 
		colModel:[ 
			{name:'id',index:'id',sorttype:"string",hidden:true},
			{name:'padrename',index:'padrename',sorttype:"string",width:80},
			{name:'name',index:'name',sorttype:"string"},
			{name:'code',index:'code',sorttype:"string",width:16},
			{name:'precio',index:'precio',sorttype:"number",formatter:'number',
				formatoptions:{decimalPlaces:2},align:"right",width:40},
			{name:'padre',index:'padre',sorttype:"string",hidden:true},
			{name:'idpn',index:'idpn',sorttype:"string",hidden:true}
		],
		caption:"Listado de categorias",
		sortname:'idpn',
	});
	$("#gridCatid").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridCatid").jqGrid('setGridWidth', $("#content").width()-20, true);
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		width: 420,
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
		close: function() {
			if(typeof $b != 'undefined') 
				$($b.target).html("<span class='glyphicon glyphicon-floppy-disk'></span> Guardar");
			document.formNew.reset();
			$(document.formNew.oper).val('add');
			$(document.formNew.id).val(0);
			$('#rowid').val(0)
			validator.resetForm();
			$.noty.closeAll();
			showMessageSys();
		}
	});
});
function add(){
	$.post(base_url+'catalogos/jsonCatid',{
		csrf_omadero:$.cookie('csrf_omadero'),
		_search:'true',
		page:1,
		rows:100,
		sidx:'c.padre',
		sord:'asc',
		searchField:'c.precio',
		searchString:'0.00',
		searchOper:'eq'
	}).done(function(data){
		var padre='';
		$('#padre option').remove();
		$('#padre').append($('<option>', { value : '0' })
			.text('PRINCIPAL'));
		if(data.records){
			for(i in data.rows){
				if(typeof data.rows[i] == 'object'){
					padre = data.rows[i].cell.padrename.replace('-','').replace('PRINCIPAL','');
					if(padre.length) padre =  padre+'-' ;
					$('#padre').append($('<option>', { value : data.rows[i].id })
						.text( padre+data.rows[i].cell.name ));
				}
			}
		}
		if(document.formNew.oper.value == 'edit' && $('#rowid').val().length > 0){
			var	rowdata = $("#gridCatid").getRowData($('#rowid').val());
			$('#padre').val(rowdata.padre);
		}
		$('#dialog-form-new').removeClass('hide');
		$('#dialog-form-new').dialog('open');
		document.formNew.name.focus();
	});
}
function edit(){
	var rowid = $("#gridCatid").jqGrid('getGridParam','selrow');
	if(rowid == null){
		msg("Selecciona una categoria para editar","warning");
		return false;
	}
	var	data = $("#gridCatid").getRowData(rowid);
	document.formNew.name.value = data.name;
	document.formNew.id.value = data.id;
	document.formNew.code.value = data.code;
	document.formNew.precio.value = data.precio;
	document.formNew.oper.value = 'edit';
	$('#rowid').val(rowid);
	add();
}
function eliminar(){
	var rowid = $("#gridCatid").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$("#gridCatid").jqGrid('delGridRow',rowid,{reloadAfterSubmit:true,closeOnEscape:true,closeAfterDelete:true,
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
