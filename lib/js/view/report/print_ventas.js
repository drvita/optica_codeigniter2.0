var $gridtime;
$(function(){
	$("#gridVentas").jqGrid({
		url: base_url + 'store/jsonVentas',
		colNames:['FECHA','CLIENTE','NOTA','ACCION','METODO','MONTO','BANCO'], 
		colModel:[ 
			{name:'date',index:'date',width:25,sorttype:"date",formatter:"date",searchoptions:{dataInit:datePick}},
			{name:'contacto',index:'contacto',width:0,sorttype:"string"},
			{name:'idserver',index:'idserver',width:20,sorttype:"string"},
			{name:'accion',index:'accion',width:30,sorttype:"string"},
			{name:'metodopago',index:'metodopago',width:60,sorttype:"string"},
			{name:'montopago',index:'montopago',width:30,sorttype:"number",search:false,formatter:"number",align:"right",
				formatoptions:{thousandsSeparator:" ",defaultValue:'0',decimalPlaces:2}},
			{name:'banco',index:'banco',width:0,sorttype:"string",search:false,hidden:true},
		],
		caption:'Ventas por fecha',
		sortname:'date',
		footerrow: true,
		userDataOnFooter: true,
		gridComplete: function(){
			var parsePago=  $(this).jqGrid('getCol', 'montopago', false, 'sum'),
				parsePendiente=  $(this).jqGrid('getCol', 'pendiente', false, 'sum');
            $(this).jqGrid('footerData', 'set', {
            	metodopago:'SUMATORIAS',
            	montopago:parsePago,
            	pendiente:parsePendiente
            });
			$("option[value=100000000]").text('Todos');
			if($gridtime) clearTimeout($gridtime);
			$gridtime = setTimeout(function(){$('#gridVentas').trigger('reloadGrid')},60000);
        },
        ondblClickRow: function(rowid) {
        	excel();
        },
		serializeGridData: function(xhr){
			var date = new Date();
			date.setDate(date.getDate()-1);
			xhr._search = 'true';
			if(typeof xhr.searchField=='undefined' || !xhr.searchField.length) xhr.searchField='date';
			if(typeof xhr.searchString=='undefined' || !xhr.searchString.length) xhr.searchString=$.datepicker.formatDate('yy-mm-dd',new Date());
			if(typeof xhr.searchOper=='undefined' || !xhr.searchOper.length) xhr.searchOper='eq';
			if(typeof xhr.filters=='undefined' || !xhr.filters.length){
				var filtersdata = {
						groupOp: 'AND',
						rules: [
						    {"field":"date","op":"eq","data":$.datepicker.formatDate('yy-mm-dd',date)},
						    {"field":"accion","op":"eq","data":'INGRESO'},
						    {"field":"metodopago","op":"eq","data":'EFECTIVO'}
						]
					};
				xhr.filters = JSON.stringify(filtersdata);
			}
			return xhr;
		}
	});
	$("#gridVentas").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridVentas").jqGrid('setGridWidth', $("#grid").width()-20, true);
});
function buscar(){
	$('#gridVentas').jqGrid('searchGrid',{closeOnEscape:true,closeAfterSearch:true,multipleSearch:true,
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
function excel(){
	$("#gridVentas").jqGrid('exportarExcel',{nombre:"Ventas",formato:"excel"});
}
function datePick(elem){
   $(elem).datepicker({dateFormat:"yy-mm-dd"});
}
