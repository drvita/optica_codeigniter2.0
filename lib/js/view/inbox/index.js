var $testime,$testjson=new Object(),$pedidosjson=new Object(),$b,$lastsel2,data=new Object(),mpitems=new Object();
$(function(){
	$("#gridcaja").jqGrid({
		datatype:"local",
		height: 150,
		colNames:['id','Codigo','Und','Producto','Precio'], 
		colModel:[ 
			{name:'id',index:'id',width:0,sorttype:"integer",hidden:true},
			{name:'code',index:'code',width:60,sorttype:"string",editable:true},
			{name:'und',index:'und',width:20,sorttype:"integer",editable:true},
			{name:'item',index:'item',width:0,sorttype:"string",editable:true},
			{name:'price',index:'price',width:40,sorttuype:"number",formatter:"number",align:"right",
				formatoptions:{thousandsSeparator:" ",defaultValue:'0',decimalPlaces:2},editable:true}
		],
		footerrow: true,
		userDataOnFooter: true,
		pager:'',
		gridComplete: function(){
			var parseTotal=  $(this).jqGrid('getCol', 'price', false, 'sum'),
				fullData = $(this).jqGrid('getRowData');
            $(this).jqGrid('footerData','set',{item:'TOTAL',price:parseTotal});
            $("#code").val('');
            $('#venta_total').val(parseTotal);
            $('#items').val(JSON.stringify(fullData));
        }
	});
	$("#gridcaja").jqGrid('setGridWidth',$("#panel-caja").width()-10, true);
	$('#remove-client').click(function(){
		setClient(0,'');
	});
	$('#goexamen').click(function(){
		add_examen();
	});
	$('#addPedido').click(function(){
		addPedido($('#idclient').val());
	});
	$("#cliente").autocomplete({
		source: function(request,response){
			var filtersdata = {
					groupOp: 'OR',
					rules: [
					    {"field":"contacto","op":"cn","data":request.term},
					    {"field":"name","op":"cn","data":request.term}
					]
				};
			$.post(base_url + 'catalogos/jsonContacts',{
				_search:true,
				searchField:'contacto',
				searchOper:'cn',
				searchString:request.term,
				rows:5,
				sidx:'contacto',
				filters:JSON.stringify(filtersdata),
				csrf_omadero:$.cookie('csrf_omadero')
			}).done(function(data){
				var row = new Array(),htmlname='';
				if(data.records){
					for (var p in data.rows){
						if(isNaN(p)) break;
						htmlname = $.parseHTML(data.rows[p].cell.contacto);
						row[p] = new Object();
						row[p].label = $(htmlname).text();
						row[p].value = $(htmlname).text();
						row[p].row = data.rows[p].cell;
					}
				} else {
					row[0] = new Object();
					row[0].label = 'Sin registros';
					row[0].value = '';
				}
				response( row );
			});
		},
		minLength: 3,
		select: function( event, ui ){
			setClient(ui.item.row.id,ui.item.row.name);
		}
	});
	//Codigo de productos
	$( "#code" ).autocomplete({
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
				searchField:'i.name',
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
			$( "#code" ).val('');
			return false;
		}
	});
	load_test();
	$('#code').focus();
	$('#c_pagar').click(function(){
		pagar_monto();
	});
	$('#c_metododepago').change(function(){
		var detalles=new Object(), val = $(this).val();
		detalles.banco='';
		detalles.digitos=0; 
		detalles.promo=0;
		$('#c_banco').val('{}');
		if(val=='TARJETA DE CREDITO' || val=='TARJETA DE DEBITO' || val=='CHEQUE'){
			detalles.banco = prompt("Banco", "");
			detalles.digitos = prompt("Ultimos 4 digitos", "");
			if(val=='TARJETA DE CREDITO'){
				detalles.promo = prompt("Meses sin intereses (numero de meses)",12);
				detalles.promo = parseInt(detalles.promo);
			}
			detalles.banco = detalles.banco.toUpperCase();
			detalles.digitos = parseInt(detalles.digitos);
			$('#c_banco').val(JSON.stringify(detalles));
		}
	});
	$('#year').change(function(){
		load_test();
	});
	$('#rows').change(function(){
		load_test();
	});
});
function add_examen(){
	var idclient = $('#idclient').val();
	if(idclient<1000){
		msg('Seleccione un <strong>PACIENTE</strong> primero','warning');
		return false;
	}
	confirm('Confirme que desea <strong>AGREGAR</strong> un nuevo examen',[
		{
			addClass: 'btn btn-default', 
			text: 'Cancelar', 
			onClick: function($noty){
				$noty.close();
			}
		},
		{
			addClass: 'btn btn-success', 
			text: 'Confirmar', 
			onClick: function($noty){
				$noty.close();
				$.post(base_url + "optica/saveExamenes",{
					oper:"add",
					idclient:idclient,
					status:0,
					csrf_omadero:$.cookie('csrf_omadero')
				}).done(function(data){
					if(data.result) load_test();
					$.noty.closeAll();
					showMessageSys();
				});
			}
		}
	]);
}
function addPedido(){
	if($('#idclient').val()<1000){
		msg('Seleccione un <strong>PACIENTE</strong> primero','warning');
		return false;
	}
	$noexit=false;
	$('#formservices').attr('action',base_url+'pedidos/nuevo');
	$('#formservices').submit();
}
function del_examen(id){
	if(id>0 && $testjson.records>0){
		for(i in $testjson.rows){
			if($testjson.rows[i].id == id){
				data = $testjson.rows[i].cell
				break;
			}
		}
		confirm('Desea dar de <strong>BAJA</strong> el examen de '+data.contacto,[{
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
				$.post(base_url + "optica/saveExamenes",{
					oper:"del",
					id:id,
					csrf_omadero:$.cookie('csrf_omadero')
				}).done(function(data){
					if(data.result) load_test();
					$.noty.closeAll();
					$('#code').focus();
					showMessageSys();
				});
			}
		}]);
	}
}
function openServices(id){
	var telefonos='',items;
	if(id>0 && $pedidosjson.records>0){
		data=new Object();
		for(i in $pedidosjson.rows){
			if($pedidosjson.rows[i].id == id){
				data = $pedidosjson.rows[i].cell
				break;
			}
		}
		if(typeof data.status == 'undefined') return false;
		setClient(data.idcliente,data.contacto);
		$('#idserver').val(data.id);
		$('#idtest').val(data.test);
		if(data.status=='3'){
			items=$.parseJSON(data.items);
			if(data.descuento>0){
				items[items.length]={
					id:997,
					code:0,
					und:1,
					item:'DESCUENTO',
					price:data.descuento*-1
				};
			}
			if(data.anticipo>0){
				items[items.length]={
					id:998,
					code:0,
					und:1,
					item:'ANTICIPO',
					price:data.anticipo*-1
				};
			}
			if($('#idserver').val()>0){
				items[items.length]={
					id:999,
					code:0,
					und:'1',
					item:'PEDIDO N. '+$('#idserver').val(),
					price:0
				};
			}
			for(i in items){
				if(typeof items[i] != 'object') continue;
				if(!items[i].price) items[i].price = 0;
				$("#gridcaja").jqGrid('addRowData',i,items[i]);
			}
		} else $('#gridcaja').trigger('reloadGrid');
	} else setClient(0,'');
}
function setClient(id,name){
	document.formservices.reset();
	$('#c_banco').val('{}');
	$('#c_metododepago').val('EFECTIVO');
	if(id > 999){
		$('#cliente').prop('disabled',true);
		if(id > 1000) $('#client-button > button').prop('disabled',false);
		$('#cliente').val(name);
		$('#idclient').val(id);
		$('#gridcaja').jqGrid('clearGridData');
		$('#code').prop('disabled',false);
		$('#code').focus();
	} else {
		confirm('Quiere <strong>CERRAR</strong> la sesión de '+$('#cliente').val(),[{
			addClass: 'btn btn-default', 
			text: 'Cancelar', 
			onClick: function($noty) {
				$.noty.closeAll();
			}
		},
		{
			addClass: 'btn btn-success', 
			text: 'Confirmar', 
			onClick: function($noty){
				$('#cliente').val('');
				$('#idclient').val(0);
				$('#gridcaja').jqGrid('clearGridData');
				$('#cliente').prop('disabled',false);
				$('#client-button > button').prop('disabled',true);
				$('#code').prop('disabled',true);
				$('#cliente').focus();
				data=new Object();
				mpitems=new Object();
				$.noty.closeAll();
			}
		}]);
	}
	$('#idserver').val(0);
}
function pagar_monto(){
	var count=0,monto=0,total=0,mp='EFECTIVO',items,i,mp_num,mp_count;
	count = $("#gridcaja").getGridParam("reccount");
	serie = $("#year").val();
	if(serie<2015){
		msg('Error al procesar el serial del pedido, llame al administrador','error');
		return false;
	}
	$("#serie").val(serie);
	monto = parseInt($("input[name='montopago']").val()),
	total = parseFloat($('#venta_total').val());
	mp = $('#c_metododepago').val();
	if(mp=='EFECTIVO') mp_num='1001';
	else if(mp=='CHEQUE') mp_num='1002';
	else if(mp=='TARJETA DE CREDITO') mp_num='1003';
	else if(mp=='TARJETA DE DEBITO') mp_num='1004';
	else if(mp=='TRANSFERENCIA BANCARIA') mp_num='1005';
	else if(mp=='CREDITO') mp_num='996';
	else if(mp=='DESCUENTO') mp_num='997';
	if(monto<=total){
		if(monto<=0 && total){
			$("input[name='montopago']").val(0);
			monto=0;
			msg(mp + ' registrado es CERO, registre una cantidad mayor a esta','warning');
			return false;
		}
		mp_count = Object.keys(mpitems).length ? Object.keys(mpitems).length : 0;
		if(mp_count && total){
			if(typeof mpitems[mp_num] != 'undefined'){
				msg("Este metodo de pago ya fue cargado, <strong>eliminelo</strong> para cargarlo nuevamente",'warning');
				delete mpitems[mp_num];
			}
		}
		if(total){
			i=parseInt($("#gridcaja").getGridParam("records"),10);
			mpitems[mp_num]={
				id:mp_num,
				code:0,
				und:1,
				item:mp,
				price:monto*-1
			};
			$("#gridcaja").jqGrid('addRowData',mp_num,mpitems[mp_num]);
			$("input[name='montopago']").val(0);
			$('#c_metododepago').val('EFECTIVO');
		}
		if(monto<total)return false;
	} else {
		msg('Monto en ['+ mp + '] superior el total por pagar','warning');
		$("input[name='montopago']").val(0);
		$('#c_metododepago').val('EFECTIVO');
		return false;
	}
	if(count){
		confirm('¿Quiere <strong>terminar</strong> la venta?',[{
			addClass: 'btn btn-default', 
			text: 'Cancelar', 
			onClick: function($noty) {
				$.noty.closeAll();
			}
		},
		{
			addClass: 'btn btn-success', 
			text: 'Confirmar', 
			onClick: function($noty){
				$noty.close();
				$.post(base_url + 'inbox/saveventa',
					$('#formservices').serialize()
				).done(function(data){
					if(data.result){
						$("#gridcaja").jqGrid('clearGridData');
						setClient(0,'');
						showMessageSys();
						load_test();
					}
				});
				mpitems=new Object();
			}
		}]);
	} else msg('No hay <strong>productos</strong> a cobrar o el monto es cero','warning');
	$( "#code" ).val('');
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
function load_test(){
	$("#list-examenes").empty();
	$("#list-pedidos").empty();
	$.post(base_url + "optica/jsonExamenes",{
		csrf_omadero:$.cookie('csrf_omadero'),
		_search:'true',
		searchField:'status',
		searchString:2,
		searchOper:'eq',
		rows:80,
		sidx:'date'
	}).done(function(result){
		$testjson = result;
		if(parseInt(result.records)){
			for(i in result.rows){
				if(typeof result.rows[i] != 'object') continue;
				var status = " disabled",
					data = result.rows[i].cell,
					st = parseInt(data.status),
					htmlname = $.parseHTML(data.contacto),
					name = $(htmlname).text(),
					cnt = parseInt(name.length),
					onclick = "";
				if(st){
					status = " list-group-item-success";
					onclick = 'onclick="setClient('+data.idclient+',\''+data.contacto+'\')"';
				} else {
					onclick = '';
				}
				$("#list-examenes").append(
					'<li><a href="javascript:void(0)"'+onclick+'id="'+result.rows[i].id+'"><h3>'+
					name +'<small class="pull-right">'+result.rows[i].cell.id+'</small></h3></a></li>'
				);
			}
		} else
			$("#list-examenes").html('<li><a href="javascript:void(0)">No hay pendientes</a><li>');
	});
	//Pedidos
	var filtersdata={
		groupOp: 'OR',
		rules: [
			{"field":"statusname","op":"eq","data":3},
			{"field":"year","op":"lt","data":$('#year').val()}
		]
	};
	$.post(base_url + "pedidos/jsonPedidos",{
		csrf_omadero:$.cookie('csrf_omadero'),
		_search:'true',
		searchField:'status',
		searchString:3,
		searchOper:'eq',
		filters:JSON.stringify(filtersdata),
		rows:$('#rows').val(),
		sidx:'date'
	}).done(function(result){
		$pedidosjson = result;
		if(result.records){
			var cnt = 0, html = '';
			$(result.rows).each(function(i,field){
				var bg = "", fn = "",
					ent = '</div><div class="icon"><i class="ion ion-ios7-pricetag-outline"></i></div>',
					onclick='onclick="openServices('+field.id+')"';
				if(!cnt) bg = '<div class="row"><div class="col-md-6"><div class="small-box bg-aqua"><div class="inner"><h3>';
				else bg = '<div class="col-md-6"><div class="small-box bg-aqua"><div class="inner"><h3>';
				if(cnt){
					fn="</div>";
					cnt=0;
				} else cnt=1;
				html += bg+ field.cell.id.pad('0',6) +'</h3><p>'+ $('<p>'+field.cell.contacto+'</p>').text() +'</p>'+ ent
				+'<a class="small-box-footer"href="javascript:void(0)"'+ onclick +'>Cobrar <i class="fa fa-arrow-circle-right"></i></a>'
				+'</div></div>'+ fn;
			});
			if(!cnt) html += "</div>";
			$("#list-pedidos").append(html);
		}
	});
	if($testime) clearTimeout($testime);
	$testime = setTimeout(function(){load_test()},60000);
}
