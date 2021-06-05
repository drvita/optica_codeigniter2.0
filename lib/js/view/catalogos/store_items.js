var $form,$b,$catid;
$(function(){
	$form = $(document.formNew);
	$catid = $.parseJSON($('#jsoncatid').val());
	var validator = $( $form ).validate({
		invalidHandler:function(event,valid){
			var errors = valid.numberOfInvalids();
			if (errors)
				valid.errorList[0].element.focus();
		},
		submitHandler: function(form){
			$.post($(form).attr( "action" ),
				$(form).serialize()
			).done(function(data){
				if(typeof data.result != 'undefined'){
					$("#dialog-form-new").dialog( "close" );
					$('#gridStore').trigger( 'reloadGrid' );
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
	$("#gridStore").jqGrid({
		url: base_url + 'catalogos/jsonStoreItem',
		editurl: base_url + 'catalogos/saveStoreItem',
		postData:{csrf_omadero:$.cookie('csrf_omadero')},
		colNames:['Codigo','Fecha','Nombre','Categoria','Proveedor','Precio','Cant','supplier','id','idcat','grad','brand'], 
		colModel:[ 
			{name:'code',index:'code',width:70,sorttype:"string"},
			{name:'date',index:'date',width:35,sorttype:"date",formatter:"date"},
			{name:'name',index:'name',sorttype:"string"},
			{name:'catidname',index:'catidname',width:60,sorttype:"string"},
			{name:'sname',index:'sname', width:140,sorttype:"string",search:false,searchoptions:{searchhidden:false}},
			{name:'price',index:'price', width:30,sorttype:"integer",formatter:"integer",align:"right",
				formatoptions:{thousandsSeparator:" ",defaultValue:'0'}},
			{name:'cant',index:'cant',width:20,sorttype:"integer",search:false,formatter:"integer",align:"right"},
			{name:'supplier',index:'supplier',sorttype:"string",hidden:true,search:false,searchoptions:{searchhidden:false}},
			{name:'id',index:'id',sorttype:"int",hidden:true},
			{name:'catid',index:'catid',hidden:true},
			{name:'grad',index:'grad',hidden:true},
			{name:'brand',index:'brand',hidden:true},
		],
		caption:"Listado de productos",
		sortname:'code',
		serializeGridData: function(xhr){
			xhr._search = 'true';
			if(typeof xhr.searchField=='undefined' || !xhr.searchField.length) xhr.searchField='code';
			if(typeof xhr.searchString=='undefined' || !xhr.searchString.length) xhr.searchString='MF';
			if(typeof xhr.searchOper=='undefined' || !xhr.searchOper.length) xhr.searchOper='bn';
			return xhr;
		}
	});
	$("#gridStore").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		width: 580,
		position:'center',
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
		close: function(){
			if(typeof $b != 'undefined') 
				$($b.target).html("<span class='glyphicon glyphicon-floppy-disk'></span> Guardar");
			document.formNew.reset();
			$(document.formNew.oper).val('add');
			$(document.formNew.id).val(0);
			$('#brand').prop('disabled',false);
			validator.resetForm();
			$.noty.closeAll();
			showMessageSys();
		}
	});
	$('#supplier').change(function(){
		brand();
	});
	brand();
	$('#brand').change(function(){
		$('#name').val($('#catid option:selected').text() +' '+ $('#brand option:selected').text());
	});
});
function buscar(){
	$('#gridStore').jqGrid('searchGrid',{closeOnEscape:true,closeAfterSearch:true,
	afterShowSearch:function(form_id){
		var thisForm = form_id.selector.replace('fbox','searchmodfbox');
        var dialogHeight = $(thisForm).height();
        var dialogWidth = $(thisForm).width();
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        $(thisForm).css('position','fixed');
        $(thisForm).css('top',(windowHeight-dialogHeight)/2);
        $(thisForm).css('left',(windowWidth-dialogWidth)/2);
	}});
}
function add(){
	$('#dialog-form-new').dialog('open');
	$('#dialog-form-new').removeClass('hide');
}
function edit(){
	var rowid = $("#gridStore").jqGrid('getGridParam','selrow'),
		rowData;
	if( rowid != null ){
		rowData = $("#gridStore").getRowData(rowid);
		$("form[name='formNew'] input, form[name='formNew'] select").each(function(key,val){
			if(typeof rowData[$(val).attr('name')] != 'undefined'){
				$(val).val(rowData[$(val).attr('name')]);
			}
			if($(val).attr('name')=="oper")
				$(val).val('edit');
		});
		add();
	} else msg("Selecciona una categoria para editar","warning");
}
function eliminar(){
	var rowid = $("#gridStore").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$("#gridStore").jqGrid('delGridRow',rowid,{reloadAfterSubmit:true,closeOnEscape:true,closeAfterDelete:true,
		afterShowForm:function(form_id){
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
function brand(){
	$.post('jsonStoreBrand',{
		_search:'true',
		searchField:'supplier',
		searchOper:'eq',
		searchString:$('#supplier').val(),
		sidx:'name',
		rows:100,
		csrf_omadero:$.cookie('csrf_omadero')
	}).done(function(data){
		$('#brand option').remove();
		if(data.records){
			for(i in data.rows){
				if(typeof data.rows[i] != 'object') continue;
				$('#brand')
					.append($('<option>', { value : data.rows[i].id })
					.text(data.rows[i].cell.name)); 
			}
			$('#brand').change();
		}
	});
}
