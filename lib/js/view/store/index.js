var $form,$gridtime,$b;
$(function(){
	$form = $(document.formNew);
	var validator = $($form).validate({
		ignore: "#date",
		invalidHandler:function(event,valid){
			var errors = valid.numberOfInvalids();
			if (errors)
				valid.errorList[0].element.focus();
		},
		submitHandler: function(form){
			$.post($(form).attr( "action" ),$(form).serialize()).done(function(data){
				if(data.result && data!=null){
					$("#dialog-form-new").dialog("close");
					$('#gridStore').trigger('reloadGrid');
				} else {
					showMessageSys();
					clearTimeout($timeout);
				}
			}).fail(function(){
				showMessageSys();
				$($b.target).text('Guardar');
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
		url: base_url + 'store/jsonStoreLot',
		editurl: base_url + 'store/saveLot',
		colNames:['Factura','Codigo','Fecha','Articulo','Costo','Precio','Cant','ids','id','date'], 
		colModel:[ 
			{name:'bill',index:'bill',width:40,sorttype:"string"},
			{name:'code',index:'code',width:20,sorttype:"string",search:false,searchoptions:{searchhidden:false}},
			{name:'date',index:'date',width:35,sorttype:"date",formatter:"date"},
			{name:'name',index:'name',sorttype:"string",search:false,searchoptions:{searchhidden:false}},
			{name:'cost',index:'cost',width:30,sorttype:"number",formatter:"number",align:"right",
				formatoptions:{decimalSeparator:".",thousandsSeparator:",",decimalPlaces:2,defaultValue:'0.00'}},
			{name:'price',index:'price',width:30,sorttype:"number",formatter:"number",align:"right",
				formatoptions:{decimalSeparator:".",thousandsSeparator:",",decimalPlaces:2,defaultValue:'0.00'}},
			{name:'amount',index:'amount',width:20,sorttype:"integer",formatter:"integer",align:"right",
				formatoptions:{thousandsSeparator:" ",defaultValue:'0'}},
			{name:'id',index:'id',sorttype:"integer",hidden:true,search:false,searchoptions:{searchhidden:false}},
			{name:'ids',index:'ids',sorttype:"integer",hidden:true,search:false,searchoptions:{searchhidden:false}},
			{name:'date',index:'date',sorttype:"text",hidden:true,search:false,searchoptions:{searchhidden:false}}
		],
		caption:"Listado de lotes de productos",
		sortname:'date',
		gridComplete: function(){
			$("option[value=100000000]").text('Todos');
			if($gridtime) clearTimeout($gridtime);
			$gridtime = setTimeout(function(){$('#gridStore').trigger('reloadGrid')},60000);
        },
        serializeGridData: function(xhr){
			xhr._search = 'true';
			if(typeof xhr.searchField=='undefined' || !xhr.searchField.length) xhr.searchField='code';
			if(typeof xhr.searchString=='undefined' || !xhr.searchString.length) xhr.searchString='MF';
			if(typeof xhr.searchOper=='undefined' || !xhr.searchOper.length) xhr.searchOper='bn';
			return xhr;
		}
	});
	$("#gridStore").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridStore").jqGrid('setGridWidth', $("#content").width()-20, true);
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		dialogClass: 'panel panel-default',
		width: 580,
		open: function(){
			clearTimeout($timeout);
			clearTimeout($gridtime);
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
			$("form[name='formNew'] input").each(function(key,val){
				if($(val).attr('type')!="hidden")
					$(val).prop('disabled',true);
				if($(val).attr('name')=="code")
					$(val).prop('disabled',false);
			});
			validator.resetForm();
			$.noty.closeAll();
			showMessageSys();
		}
	});
	$( "#date" ).datepicker({
		dateFormat: "yy-mm-dd",
		onSelect:function(date,i){
			$('#bill').focus();
		}
	});
	$( "#code" ).autocomplete({
		source: function(request,response){
			$.post(base_url+"catalogos/jsonStoreItemSearch",{
				word:request.term,
				csrf_omadero:$.cookie('csrf_omadero')
			}).done(function(data){
				response( data );
			});
		},
		minLength: 3,
		select: function( event, ui ){
			if(!ui.item.value.length) return false;
			$("form[name='formNew'] input").each(function(key,val){
				if($(val).attr('type')!="hidden")
					$(val).prop('disabled',false);
				if($(val).attr('name')=="code")
					$(val).prop('disabled',true);
				if($(val).attr('name')=="date")
					$(val).focus();
				if($(val).attr('name')=="ids")
					$(val).val(ui.item.row.id);
			});
		}
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
	$('#dialog-form-new').removeClass('hide');
	$('#dialog-form-new').dialog('open');
}
function edit(){
	var rowid = $("#gridStore").jqGrid('getGridParam','selrow'),
		rowData,mydate,str;
	if( rowid != null ){
		rowData = $("#gridStore").getRowData(rowid);
		$("form[name='formNew'] input").each(function(key,val){
			if(typeof rowData[$(val).attr('name')] != 'undefined')
				$(val).val(rowData[$(val).attr('name')]);
			if($(val).attr('name')=="oper")
				$(val).val('edit');
			if($(val).attr('type')!="hidden")
				$(val).prop('disabled',false);
			if($(val).attr('name')=="code")
				$(val).prop('disabled',true);
		});
		add();
	} else msg("Selecciona una categoria para editar","warning");
}
function eliminar(){
	var rowid = $("#gridStore").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$("#gridStore").jqGrid('delGridRow',rowid,{reloadAfterSubmit:true,closeOnEscape:true,closeAfterDelete:true,
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
