var $gridtime;
$(function(){
	$("#gridPedidos").jqGrid({
		url: base_url + 'pedidos/jsonPedidos',
		editurl: base_url + 'pedidos/savePedido',
		colNames:['NOTA','CAJA','FECHA','PACIENTE','LABORATORIO','FOLIO','PROCESO','OBSERVACIONES','SERIE'], 
		colModel:[ 
			{name:'id',index:'id',width:20,sorttype:"string"},
			{name:'ncaja',index:'ncaja',width:20,sorttype:"string",align:"right",search:false},
			{name:'date',index:'date',width:30,sorttype:"date",formatter:"date"},
			{name:'contacto',index:'contacto',width:0,sorttype:"string",searchoptions:{sopt:["cn","bw"]}},
			{name:'laboratorioname',index:'laboratorioname',width:105,sorttype:"string",search:false},
			{name:'npedidolab',index:'npedidolab',width:32,sorttype:"integer",align:"right"},
			{name:'statusname',index:'statusname',width:50,sorttype:"string"},
			{name:'observaciones',index:'observaciones',width:1,sorttype:"string",hidden:true,search:true},
			{name:'year',index:'year',width:1,sorttype:"string",search:true},
		],
		caption:'Pedidos pendientes de procesar por serie',
		sortname:'p.id',
		sortorder:'desc',
		gridComplete: function(){
			$("option[value=100000000]").text('Todos');
			if($gridtime) clearTimeout($gridtime);
			$gridtime = setTimeout(function(){$('#gridPedidos').trigger('reloadGrid')},60000);
			var filters = JSON.parse($(this).getGridParam("postData").filters);
			for (var x in filters.rules){
				if(!isNaN(x) && filters.rules[x].field=="year"){
					$('#year').val(filters.rules[x].data);
				}
			}
        },
        ondblClickRow: function(rowid){
			edit();
        },
        serializeGridData: function(xhr){
			xhr._search = 'true';
			if(xhr.searchField=='contacto') xhr.searchField='c.contacto';
			if(typeof xhr.searchField=='undefined' || !xhr.searchField.length) xhr.searchField='statusname';
			if(typeof xhr.searchString=='undefined' || !xhr.searchString.length) xhr.searchString=3;
			if(typeof xhr.searchOper=='undefined' || !xhr.searchOper.length) xhr.searchOper='lt';
			if(typeof xhr.filters=='undefined' || !xhr.filters.length){
				var filtersdata = {
					groupOp: 'OR',
					rules: [
					    {"field":"statusname","op":"lt","data":3},
					    {"field":"year","op":"lt","data":$('#year').val()}
					]
				};
				xhr.filters = JSON.stringify(filtersdata);
			}
			return xhr;
		}
	});
	$("#gridPedidos").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridPedidos").jqGrid('setGridWidth', $("#content").width()-5, true);
});
function buscar(){
	$('#gridPedidos').jqGrid('searchGrid',{closeOnEscape:true,closeAfterSearch:true,multipleSearch:true,
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
function edit(){
	var rowid = $("#gridPedidos").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$('#formpedido').attr('action',base_url+'pedidos/pedido');
		$('#formpedido').attr('target','_self');
		$('#idpedido').val(rowid);
		$noexit=false;
		$('#formpedido').submit();
	} else msg("Selecciona un pedido para <strong>procesar</strong>","warning");
}
function eliminar(){
	var rowid = $("#gridPedidos").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$("#gridPedidos").jqGrid('delGridRow',rowid,{reloadAfterSubmit:true,closeOnEscape:true,closeAfterDelete:true,
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
		},onclickSubmit:function(){
            return {csrf_omadero:$.cookie('csrf_omadero')};
        }});
	} else msg("Selecciona un pedido para <strong>eliminar</strong>","warning");
}
function printed(){
	var rowid = $("#gridPedidos").jqGrid('getGridParam','selrow');
	if( rowid == null ){
		msg("Seleccione un pedido",'warning');
		return false;
	}
	$('#formpedido').attr('action',base_url+'report/print_nota_pdf');
	$('#formpedido').attr('target','_blank');
	$('#idpedido').val(rowid);
	$noexit=false;
	$('#formpedido').submit();
}
