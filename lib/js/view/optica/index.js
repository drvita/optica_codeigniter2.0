var $form,$gridtime;
$(function(){
	$form = $('#opentest');
	$("#gridexamen").jqGrid({
		url: base_url + 'optica/jsonExamenes',
		editurl: base_url + 'optica/saveExamenes',
		colNames:['ID','Fecha','Paciente','Esfera D','Cilindro D','Eje D','Adc D','DP D','Esfera I','Cilindro I','Eje I','Adc I','DP I','Estado'], 
		colModel:[ 
			{name:'id',index:'id',width:20,sorttype:"string"},
			{name:'date',index:'date',width:35,sorttype:"date",formatter:"date",searchoptions:{dataInit:datePick}},
			{name:'contacto',index:'contacto',width:0,sorttuype:"string",searchoptions:{sopt:["cn","bw"]}},
			{name:'esferaod',index:'esferaod',width:30,sorttuype:"number"},
			{name:'cilindrod',index:'cilindrod',width:30,sorttuype:"number"},
			{name:'ejeod',index:'ejeod',width:30,sorttuype:"number"},
			{name:'adiciond',index:'adiciond',width:30,sorttuype:"number"},
			{name:'dpod',index:'adicioni',width:30,sorttuype:"number"},
			
			{name:'esferaoi',index:'esferaoi',width:30,sorttuype:"number"},
			{name:'cilindroi',index:'cilindroi',width:30,sorttuype:"number"},
			{name:'ejeoi',index:'ejeoi',width:30,sorttuype:"number"},
			{name:'adicioni',index:'adicioni',width:30,sorttuype:"number"},
			{name:'dpoi',index:'adicioni',width:30,sorttuype:"number"},
			{name:'statusname',index:'statusname',width:40,sorttuype:"string"}
		],
		caption:'Listado de examenes pendientes',
		sortname:'date',
		sortorder:'desc',
		gridComplete: function(){
			$("option[value=100000000]").text('Todos');
			if($gridtime) clearTimeout($gridtime);
			$gridtime = setTimeout(function(){$('#gridexamen').trigger('reloadGrid')},60000);
        },
        ondblClickRow: function(rowid){
			edit();
        },
        serializeGridData: function(xhr){
			xhr._search = 'true';
			if(typeof xhr.searchField=='undefined' || !xhr.searchField.length) xhr.searchField='status';
			if(typeof xhr.searchString=='undefined' || !xhr.searchString.length) xhr.searchString=1;
			if(typeof xhr.searchOper=='undefined' || !xhr.searchOper.length) xhr.searchOper='lt';
			if(typeof xhr.filters=='undefined' || !xhr.filters.length){
			var filtersdata = {
					groupOp: 'OR',
					rules: [
					    {"field":"statusname","op":"lt","data":1},
					    {"field":"date","op":"eq","data":$.datepicker.formatDate('yy/mm/dd',new Date())}
					]
				};
			xhr.filters = JSON.stringify(filtersdata);
			}
			return xhr;
			
		},
	});
	$("#gridexamen").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridexamen").jqGrid('setGridWidth', $("#content").width()-20, true);
	//setInterval(function(){$("#gridexamen").trigger( 'reloadGrid' )},10000);
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		dialogClass: 'panel panel-default',
		buttons:[
			{
				html:"<span class='glyphicon glyphicon-ban-circle'></span> Cerrar",
                class:"btn btn-default",
                click:function () {
					$(this).dialog( "close" );
                }
            }
		],
		close: function() {
			$.noty.closeAll();
			showMessageSys();
			$('#gridexamen').trigger( 'reloadGrid' );
		}
	});
	$( "#contacto" ).autocomplete({
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
		minLength:3,
		select: function( event, ui ){
			$('#idclient').val(ui.item.row.id);
			$.post($(document.formNew).attr("action"),
				$(document.formNew).serialize()
			).done(function(data){
				if(typeof data.result != 'undefined' && data.result>0){
					document.opentest.id.value = data.result;
					$noexit=false;
					$($form).submit();
				} else $("#dialog-form-new").dialog( "close" );
			});
		}
	});
});
function buscar(){
	$('#gridexamen').jqGrid('searchGrid',{closeOnEscape:true,closeAfterSearch:true,multipleSearch:true,
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
	document.formNew.reset();
	$('#dialog-form-new').dialog('open');
}
function edit(){
	var rowid = $("#gridexamen").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$($form).attr('action','optica/examen');
		$($form).attr('target','_self');
		document.opentest.id.value = rowid;
		$noexit=false;
		$($form).submit();
	} else msg("Selecciona un examen para <strong>EDITAR</strong>","warning");
}
function eliminar(){
	var rowid = $("#gridexamen").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$("#gridexamen").jqGrid('delGridRow',rowid,{reloadAfterSubmit:true,closeOnEscape:true,closeAfterDelete:true,
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
	} else msg("Selecciona un examen","warning");
}
function printed(){
	var rowid = $("#gridexamen").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$($form).attr('action','report/print_examen');
		$($form).attr('target','_blank');
		document.opentest.id.value = rowid;
		$noexit=false;
		$($form).submit();
	} else msg("Selecciona un examen para <strong>IMPRIMIR</strong>","warning");
}
function datePick(elem){
	$(elem).datepicker({dateFormat:"yy-mm-dd"});
}
function dpaltura(){
	msg('En construccion');
}
