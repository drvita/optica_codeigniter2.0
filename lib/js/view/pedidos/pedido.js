var $lastsel2='';
$(function(){
	var mydata=$.parseJSON($('#items').val());
	if($timeout) clearTimeout($timeout);
	$("#gridcaja").jqGrid({
		datatype:"local",
		height: 120,
		colNames:['CODE','UND','PRODUCTO','PRECIO'], 
		colModel:[ 
		    {name:'code',index:'code',width:55,sorttype:"integer",editable:true},
			{name:'und',index:'und',width:18,sorttype:"integer",editable:true,align:"right"},
			{name:'item',index:'item',width:0,sorttype:"string",editable:true},
			{name:'price',index:'price',width:0,sorttuype:"number",formatter:"number",align:"right",
				formatoptions:{thousandsSeparator:" ",defaultValue:'0',decimalPlaces:2},hidden:true}
		],
		pager:'',
		gridComplete: function(){
			var fullData = $(this).jqGrid('getRowData');
            $("#items").val(JSON.stringify(fullData));
            $( "#code" ).val('');
        }
	});
	$("#gridcaja").jqGrid('setGridWidth',$("#venta").width()-5, true);
	for(var i=0;i<=mydata.length;i++){
		if(typeof mydata[i] != 'undefined')
			$("#gridcaja").jqGrid('addRowData',mydata[i].id,mydata[i]);
	}
	$("#code").autocomplete({
		source: function(request,response){
			var filtersdata = {
					groupOp: 'OR',
					rules: [
					    {"field":"i.code","op":"bw","data":request.term},
					    {"field":"i.name","op":"bw","data":request.term}
					]
				};
			$.post(base_url + 'catalogos/jsonStoreItem',{
				_search:'true',
				searchField:'i.code',
				searchOper:'bw',
				searchString:request.term,
				rows:5,
				sidx:'code',
				filters:JSON.stringify(filtersdata),
				csrf_omadero:$.cookie('csrf_omadero')
			}).done(function(data){
				var row = new Array();
				if(data.records){
					for (var p in data.rows){
						if(isNaN(p)) break;
						row[p] = new Object();
						row[p].label = data.rows[p].cell.code+'-'+data.rows[p].cell.name;
						row[p].value = data.rows[p].cell.code;
						row[p].row = data.rows[p].cell;
					}
				} else {
					row[0] = new Object();
					row[0].label = 'No hay resultados para '+ data.searchString+' o esta en ceros';
					row[0].value = '';
					row[0].row = {};
				}
				response( row );
			});
		},
		minLength:4,
		select: function(event,ui){
			if(typeof ui.item.row != 'undefined'){
				if(typeof ui.item.row.id == 'undefined') ui.item.row.id = Math.random();
				if(typeof ui.item.row.code == 'undefined') ui.item.row.code = 0;
				if(typeof ui.item.row.price == 'undefined') ui.item.row.price = 0.00;
				if(typeof ui.item.row.name == 'undefined') ui.item.row.name = '';
				var mydata={
						id:ui.item.row.id,
						code:ui.item.row.code,
						und:1,
						price:ui.item.row.price,
						item:ui.item.row.name
					};
				$("#gridcaja").jqGrid('addRowData',ui.item.row.id,mydata);
			}
			return false;
		}
	});
	$('#statusname').change(function(){
		var status = parseInt($(this).val()),
			nlab = parseInt($('#npedidolab').val());
		if(status==1|| (status>1&&nlab>0) ) $('#laboratorio').removeClass('hidden');
		else $('#laboratorio').addClass('hidden');
	});
	$(document).keydown(function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			return false;
	    }
	});
})
function cancelar(){
	$noexit=true;
	document.location.href=base_url+"pedidos";
}
function save(){
	confirm('Desea <strong>Guardar</strong> los cambios',[{
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
			$.post($('#formsave').attr('action'),
				$('#formsave').serialize()
			).done(function(data){
				if(typeof data.result != 'undefined'){
					$noexit=false;
					document.location.href=base_url+"pedidos";
				} else {
					showMessageSys();
				}
			});
		}
	}]);
}
function edit(){
	var gr = $("#gridcaja").jqGrid('getGridParam','selrow');
	if( gr == null ){
		msg("Seleccione un item",'warning');
		return false;
	}
	$("#gridcaja").jqGrid('restoreRow',$lastsel2);
	editparameters = {
		"keys" : true,
		"oneditfunc" : null,
		"successfunc" : null,
		"datatype":"local",
		"extraparam" : {
			csrf_omadero:$.cookie('csrf_omadero')
		},
		"aftersavefunc" : function(){
			$('#gridcaja').trigger('reloadGrid');
		},
		"errorfunc": function(e){console.log(e)},
		"afterrestorefunc" : null,
		"restoreAfterError" : function(e){console.log(e)},
		"mtype" : "POST",
		"url":base_url
	}
	$("#gridcaja").jqGrid('editRow',gr,editparameters);
	$lastsel2=gr;
}
function eliminar(){
	var rowid = $("#gridcaja").jqGrid('getGridParam','selrow');
	if( rowid == null ){
		msg("Seleccione un item",'warning');
		return false;
	}
	$("#gridcaja").jqGrid('restoreRow',$lastsel2);
	$("#gridcaja").jqGrid('delRowData',rowid);
}
