var $catid = {},$lastsel2;
$(function(){
	$catid = $.parseJSON($('#catid').val());
	if($timeout) clearTimeout($timeout);
	$("#gridcaja").jqGrid({
		datatype:"local",
		height: 120,
		colNames:['COD','UND','PRODUCTO','PRECIO'], 
		colModel:[ 
		    {name:'code',index:'code',width:55,sorttype:"integer",editable:true},
			{name:'und',index:'und',width:20,sorttype:"integer",editable:true,align:"right"},
			{name:'item',index:'item',width:0,sorttype:"string",editable:true},
			{name:'price',index:'price',width:30,sorttuype:"number",formatter:"number",align:"right",
				formatoptions:{thousandsSeparator:" ",defaultValue:'0',decimalPlaces:2},editable:true}
		],
		pager:'',
		gridComplete: function(){
			var fullData = $(this).jqGrid('getRowData'),
				parseSubtotal= parseFloat( $(this).jqGrid('getCol','price',false,'sum') ).toFixed(2);
			$('#subtotal').val(parseSubtotal);
            $("#items").val(JSON.stringify(fullData));
            $( "#code" ).val('');
            total();
        }
	});
	$("#gridcaja").jqGrid('setGridWidth',$("#venta").width()-5, true);
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
					row[0].label = 'No hay resultados para '+request.term+', ingresar registro en blanco.';
					row[0].value = '';
					row[0].row = {code:request.term};
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
	$( "#subtotal,#anticipo,#descuento" ).change(function(){
		total();
	});
	$('#p_metodopago').change(function(){
		var val = $(this).val(), detalles=new Object();
		detalles.banco='';
		detalles.digitos=0; 
		detalles.promo=0;
		if(val=='TARJETA DE CREDITO' || val=='TARJETA DE DEBITO' || val=='CHEQUE'){
			detalles.banco = prompt("Banco", "");
			detalles.digitos = prompt("Ultimos 4 digitos", "");
			if(val=='TARJETA DE CREDITO'){
				detalles.promo = prompt("Meses sin intereses (numero de meses)",12);
				detalles.promo = parseInt(detalles.promo);
			}
			detalles.banco = detalles.banco.toUpperCase();
			detalles.digitos = parseInt(detalles.digitos);
			$('#detalles_banco').val(JSON.stringify(detalles));
		} else $('#detalles_banco').val('{}');
	});
	$("#fentrega").datepicker({
		dateFormat: "yy-mm-dd"
	});
	$('#examenes').change(function(){
		loadTest();
	});
	loadTest();
});
function loadTest(){
	var id = $('#examenes').val(),txoptico={},row;
	console.log(id);
	if(id == null) id = 0;
	$.post(base_url+'optica/jsonExamenes',{
		_search:true,
		searchField:'id',
		searchOper:'eq',
		searchString:id,
		rows:5,
		csrf_omadero:$.cookie('csrf_omadero')
	}).done(function(data){
		var code='',esferal1='+000',esferal2='+000',cilindrol1='000',cilindrol2='000',lente1='',lente2='',mydata,row;
		if(data.records){
			row = data.rows[0].cell;
			if(row.txoptico.length){
				txoptico = $.parseJSON(row.txoptico);
				if(typeof txoptico.tipo=='string'){
					txoptico.tipo = new Object({0:txoptico.tipo});
					txoptico.material = new Object({0:txoptico.material});
					txoptico.tx = new Object({0:txoptico.tx});
				}
				for(x in txoptico.tipo){
					if(typeof txoptico.tipo[x] != 'string') continue;
					code = '';
					switch(txoptico.tipo[x]){
					case 'MONOFOCAL':
						code = 'MF';
						break;
					case 'MONOFOCAL/TALLADO':
						code = 'MT';
						break;
					case 'BIFOCAL':
						code = 'BF';
						break;
					case 'PROGRESIVO/BASICO':
						code = 'PB';
						break;
					case 'PROGRESIVO/INDIVIDUAL':
						code = 'PI';
					case 'PROGRESIVO/PLUS':
						code = 'PP';
					}
					switch(txoptico.material[x]){
					case 'PLASTICO':
						code += 'CR';
						break;
					case 'POLICARBONATO':
						code += 'PO';
						break;
					case 'HIINDEX':
						code += 'HI';
						break;
					case 'CRISTAL':
						code += 'CL';
						break;
					}
					switch(txoptico.tx[x]){
					case 'BLANCO':
						code += 'BL';
						break;
					case 'ANTIREFLEJANTES':
						code += 'AR';
						break;
					case 'FOTOCROMATICO':
						code += 'FT';
						break;
					case 'AR/FOTOCROMATICO':
						code += 'AF';
						break;
					case 'ARM CERRADA':
						code += 'AC';
						break;
					case 'ARM 3 PZ':
						code += 'A3';
						break;
					case 'PHOTOGRAY':
						code += 'PH';
						break;
					case 'AR/FOTOCROMATICO/3PZ':
						code += 'W3';
						break;
					}
					if(code.length==6){
						if(txoptico.tipo[x]=='MONOFOCAL'){
							esferal1 = parseFloat(row.esferaod)>0 ? '+'+row.esferaod : row.esferaod;
							esferal1 = esferal1.replace('.','');
							esferal2 = parseFloat(row.esferaoi)>0 ? '+'+row.esferaoi : row.esferaoi;
							esferal2 = esferal2.replace('.','');
							cilindrol1 = row.cilindrod.replace('-','');
							cilindrol1 = cilindrol1.replace('.','');
							cilindrol2 = row.cilindroi.replace('-','');
							cilindrol2 = cilindrol2.replace('.','');
							lente1 = code + esferal1 + cilindrol1;
							lente2 = code + esferal2 + cilindrol2;
							mydata={
								id:Math.random(),
								code:lente1,
								und:1,
								price:$catid[txoptico.tipo[x]][txoptico.material[x]][txoptico.tx[x]].precio/2,
								item:txoptico.tipo[x]+'-'+txoptico.material[x]+'-'+txoptico.tx[x]+' ['+row.esferaod+'/'+row.cilindrod+']'
							};
							$("#gridcaja").jqGrid('addRowData',lente1,mydata);
							mydata={
								id:Math.random(),
								code:lente2,
								und:1,
								price:$catid[txoptico.tipo[x]][txoptico.material[x]][txoptico.tx[x]].precio/2,
								item:txoptico.tipo[x]+'-'+txoptico.material[x]+'-'+txoptico.tx[x]+' ['+row.esferaoi+'/'+row.cilindroi+']'
							};
							$("#gridcaja").jqGrid('addRowData',lente2,mydata);
						} else {
							mydata={
								id:Math.random(),
								code:code,
								und:2,
								price: parseFloat($catid[txoptico.tipo[x]][txoptico.material[x]][txoptico.tx[x]].precio).toFixed(2),
								item:txoptico.tipo[x]+'-'+txoptico.material[x]+'-'+txoptico.tx[x]
							};
							$("#gridcaja").jqGrid('addRowData',code,mydata);
						}
					}
				}
			}
			if(row.lcmarca.length){
				mydata={
					id:Math.random(),
					code:'LENCT',
					und:1,
					price:0,
					item:row.lcmarca+' ['+row.lcgod+']['+row.lcgoi+']'
				};
				$("#gridcaja").jqGrid('addRowData',code,mydata);
			}
			$('#esferaod').text(parseInt(row.esferaod)>0 ? '+'+row.esferaod : row.esferaod );
			$('#esferaoi').text(parseInt(row.esferaoi)>0 ? '+'+row.esferaoi : row.esferaoi);
			$('#cilindrod').text(row.cilindrod);
			$('#cilindroi').text(row.cilindroi);
			$('#ejeod').text(row.ejeod+'°');
			$('#ejeoi').text(row.ejeoi+'°');
			$('#adiciond').text(row.adiciond);
			$('#adicioni').text(row.adicioni);
			$('#dpod').val(row.dpod);
			$('#dpoi').val(row.dpoi);
			$('#alturaod').val(row.alturaod);
			$('#alturaoi').val(row.alturaoi);
			$('#test_id').val(data.rows[0].id);
			$('#1-observaciones').text(row.observaciones);
		} else {
			showMessageSys();
		}
	});
}
function cancelar(){
	$noexit=true;
	document.location.href=base_url+"pedidos";
}
function edit(){
	var gr = $("#gridcaja").jqGrid('getGridParam','selrow');
	if( gr == null ){
		msg("Seleccione un item",'warning');
		return false;
	}
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
		"mtype" : "POST"
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
function save(){
	$("#gridcaja").jqGrid('restoreRow',$lastsel2);
	confirm('Desea <strong>Guardar</strong> el pedido',[{
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
function valor_lente(){
	if($('#txoptico_tl').val()!=0){
		if(typeof $catid[$('#txoptico_tl').val()][$('#txoptico_ma').val()][$('#txoptico').val()] != "undefined"){
			$('#lente').val($catid[$('#txoptico_tl').val()][$('#txoptico_ma').val()][$('#txoptico').val()].precio);
			$('#consulta').val(0);
		} else {
			$('#lente').val(0);
			$('#consulta').val(250);
		}
	} else {
		$("#consulta").val(0);
		$("#armazon").val(0);
		$("#lente").val(0);
	}
	subtotal();
	total();
}
function subtotal(){
	var consulta = $("#consulta").val(),
		armazon = $("#armazon").val(),
		lente = $("#lente").val(),
		contacto = $("#lente_contacto").val(),
		suma=0;
	suma = parseFloat(consulta)+parseFloat(armazon)+parseFloat(lente)+parseFloat(contacto);
	$("#subtotal").val(suma.toFixed(2));
}
function total(){
	var subtotal = $("#subtotal").val(),
		descuento = $("#descuento").val(),
		anticipo = $("#anticipo").val(),
		suma=0;
	suma = parseFloat(subtotal)-(parseFloat(anticipo)+parseFloat(descuento));
	$("#total").val(suma.toFixed(2));
}
