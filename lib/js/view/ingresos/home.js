var $form,$gridtime;
$(function(){
	$form = $('#sendto');
	var c = new Object(),
		s = localStorage.getItem("ingresos"),
		validator = $('#formFactura').validate({	//Validador del formulario
		invalidHandler:function(event,valid){
			var errors = valid.numberOfInvalids();
			if (errors)
				valid.errorList[0].element.focus();
		},
		submitHandler:function(form){
			$('.ui-dialog-buttonset').hide();
			$.post($(form).attr( "action" ),$(form).serialize()).done(function(data){
				if(data.result && data!=null){
					document.sendto.uuid.value = data.result;
					$($form).attr('action',base_url+'ingresos/showpdf');
					$($form).attr('target','_blank');
					$($form).submit();
					$($form).attr('target','_self');
					$($form).attr('action','');
				}
				$("#dialog-form-factura").dialog( "close" );
			}).fail(function(e){
				$('.ui-dialog-buttonset').show();
				$.noty.closeAll();
				msg(e.status+": "+e.statusText,'error');
			});
			return false;
		}
	});
	if(s==null){
		c = Object.create({jqgrid:{postData:{type:0}}});
	} else {
		c = Object.create($.parseJSON(s));
	}
	var $mes=getMes();
	var $anio=getAnio();
	if(typeof c.jqgrid != 'undefined'){
		if(c.jqgrid.mes==null) c.jqgrid.mes = getMes();
		else $('#varmes').val(c.jqgrid.mes);
		if(c.jqgrid.anio==null) c.jqgrid.anio= getAnio();
		else $('#varanio').val(c.jqgrid.anio);
		if(c.jqgrid.url==null) c.jqgrid.url = base_url + 'ingresos/jsonRows/'+ c.jqgrid.anio;
		if(c.jqgrid.editurl==null) c.jqgrid.editurl = base_url + 'ingresos/editRows/'+ c.jqgrid.anio;
		if(c.jqgrid.page==null) c.jqgrid.page = 1;
		if(c.jqgrid.rowNum==null) c.jqgrid.rowNum=12;
		else c.jqgrid.rowNum = Number(c.jqgrid.rowNum);
		if(c.jqgrid.postData==null) c.jqgrid.postData='';
		else{ 
			c.jqgrid.postData.mes=c.jqgrid.mes;
		}
	} else {
		c = {
		jqgrid:{
			mes:$mes,
			anio:$anio,
			url:base_url + 'ingresos/jsonRows/'+ $anio,
			editurl:base_url + 'ingresos/editRows/'+ $anio,
			postData:{mes:$mes},
			page:1,
			rowNum:12
			}
		}
	}
	$("#gridIngresos").jqGrid({
		url: c.jqgrid.url,
		editurl: c.jqgrid.editurl,
		postData:c.jqgrid.postData,
		datatype: "json",
		mtype:'Post',
		height:280,
		colNames:['SF','Estado','Razon social','Fecha','Subtotal','IVA','Total','folio',
					'serie','uuid','factura','receptor','conceptos','impuestos'], 
		colModel:[ 
			{name:'id',index:'id',width:30, sorttype:"string",search:false,searchoptions:{searchhidden:false}},
			{name:'status',index:'status',width:40, sorttype:"string"},
			{name:'nombre',index:'nombre', sorttype:"string",search:false,searchoptions:{searchhidden:false}},
			{name:'fecha',index:'fecha',width:50,align:"center",sorttype:"date",formatter:"date",formatoptions:{newformat:"Y-m-d"},search:false,searchoptions:{searchhidden:false}},
			{name:'subtotalshow',index:'subtotalshow',width:40,formatter:'number',formatoptions:{decimalPlaces:2},align:"right",search:false,searchoptions:{searchhidden:false}},
			{name:'totaliva',index:'totaliva',width:40,formatter:'number',formatoptions:{decimalPlaces:2},align:"right",search:false,searchoptions:{searchhidden:false}},
			{name:'totalshow',index:'totalshow',width:40,formatter:'number',formatoptions:{decimalPlaces:2},align:"right",search:false,searchoptions:{searchhidden:false}},
			{name:'folio',index:'folio',sorttype:"text",hidden:true,search:true,searchoptions:{searchhidden:true}},
			{name:'serie',index:'serie',sorttype:"text",hidden:true,search:false,searchoptions:{searchhidden:false}},
			{name:'uuid',index:'uuid',sorttype:"text",hidden:true,search:true,searchoptions:{searchhidden:true}},
			{name:'factura',index:'factura',sorttype:"text",hidden:true,search:false,searchoptions:{searchhidden:false}},
			{name:'receptor',index:'receptor',sorttype:"text",hidden:true,search:false,searchoptions:{searchhidden:false}},
			{name:'conceptos',index:'conceptos',sorttype:"text",hidden:true,search:false,searchoptions:{searchhidden:false}},
			{name:'impuestos',index:'impuestos',sorttype:"text",hidden:true,search:false,searchoptions:{searchhidden:false}},
		],
		rowNum:c.jqgrid.rowNum,
		page:c.jqgrid.page,
		rowList:[10,12,15,20,100000000],
		multiselect: false,
		emptyrecords: "Sin registros",
		pager: '#navbar', 
		sortname:'id',
		sortorder:'desc',
		footerrow: true,
		userDataOnFooter: true,
		gridComplete: function(){
			var $mes=getMes();
			var $anio=getAnio();
			var parseSubtotal=  $(this).jqGrid('getCol', 'subtotalshow', false, 'sum');
			var parseImpuestos=  $(this).jqGrid('getCol', 'totaliva', false, 'sum');
			var parseTotal=  $(this).jqGrid('getCol', 'totalshow', false, 'sum');
            $(this).jqGrid('footerData', 'set', {fecha:'TOTAL',subtotalshow:parseSubtotal,totaliva:parseImpuestos,totalshow:parseTotal});
            $("option[value=100000000]").text('Todos');
            $(this).setGridParam({ url:base_url +'ingresos/jsonRows/'+ $anio});
            $(this).setGridParam({ editurl:base_url + 'ingresos/editRows/'+ $anio});
            //Almacenamos parametros
            var gridInfo = new Object();
			gridInfo = {
			 jqgrid:{
				 url:$(this).jqGrid('getGridParam', 'url'),
				 page:$(this).jqGrid('getGridParam', 'page'),
				 rowNum:$(this).jqGrid('getGridParam', 'rowNum'),
				 editurl:$(this).jqGrid('getGridParam', 'editurl'),
				 postData:$(this).jqGrid('getGridParam', 'postData'),
				 mes:$mes,
				 anio:$anio
			 }
			}
			localStorage.setItem("ingresos",JSON.stringify(gridInfo));
			if($gridtime) clearTimeout($gridtime);
			$gridtime = setTimeout(function(){$('#gridIngresos').trigger('reloadGrid')},60000);
        },
        ondblClickRow: function(rowid) {
			options();
        },
		loadError: function(xhr,status,error){
			msg(error,'warning');
		}
	});
	$("#gridIngresos").jqGrid('navGrid',"#navbar",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridIngresos").jqGrid('setGridWidth', $(".col-md-10").width(), true);
	
	$("#varmes").change(function(){
		var $mes=getMes();
		$("#gridIngresos").jqGrid("clearGridData", true);
		$('#gridIngresos').setGridParam({postData:{mes:$mes}});
        $('#gridIngresos').trigger('reloadGrid');
	});
	$("#varanio").change(function(){
		var $anio=getAnio();
		$("#gridIngresos").jqGrid("clearGridData", true);
		$('#gridIngresos').setGridParam({url:base_url +'ingresos/jsonRows/'+ $anio});
        $('#gridIngresos').trigger('reloadGrid');
	});
	$("#dialog-confirm").dialog({
		autoOpen: false,
		height:180,
		width: 320,
		modal:true,
		dialogClass: 'panel panel-default',
		open: function(){
			clearTimeout($timeout);
			clearTimeout($gridtime);
		},
		buttons:[
			{
				text:"Cancelar",
                class:"btn btn-default",
                click:function () {
					$(this).dialog( "close" );
                }
            },
            {
				text:"Confirmar",
                class:"btn btn-success",
                click:function (){
					$('.ui-dialog-buttonset').hide();
					$.post(base_url+"ingresos/cancelar",$(document.sendto).serialize()).done(function(data){
						if(data.status=='201'){
							$($form).attr('action',base_url+'ingresos/report_cancel');
							$($form).attr('target','_black');
							$($form).submit();
							$($form).attr('target','_self');
							$($form).attr('action','');
						}
					}).fail(function(e){
						$.noty.closeAll();
						msg(e.status+": "+e.statusText,'error');
					});
					$(this).dialog('close');
				}
            }
        ],
		close:function(){
			$.noty.closeAll();
			showMessageSys();
			$('#gridIngresos').trigger( 'reloadGrid' );
			$('.ui-dialog-buttonset').show();
		}
	});
	$( "#dialog-opciones" ).dialog({
		autoOpen: false,
		modal: true,
		width: 620,
		dialogClass: 'panel panel-default',
		open: function(){
			clearTimeout($timeout);
			clearTimeout($gridtime);
		},
		buttons:[
			{
				text:"Cerrar",
                class:"btn btn-default",
                click:function () {
					$(this).dialog( "close" );
                }
            }
		],
		close:function(){
			$.noty.closeAll();
			showMessageSys();
			$('#gridIngresos').trigger( 'reloadGrid' );
		}
	});
	$( "#dialog-form-factura" ).dialog({
		autoOpen: false,
		modal: true,
		width: 820,
		dialogClass: 'panel panel-default',
		open: function(){
			clearTimeout($timeout);
			clearTimeout($gridtime);
		},
		buttons:[
			{
				text:"Cerrar",
                class:"btn btn-default",
                click:function () {
					$(this).dialog( "close" );
                }
            },
            {
				text:"Guardar",
				class:"btn btn-info",
                click:function(){
					$("#tabs").tabs({active:0});
						if(!$('#formFactura').valid())
							return false;
					$("#tabs").tabs({active:1});
						if(!$('#formFactura').valid())
							return false;
					$("#tabs").tabs({active:2});
						if(!$('#formFactura').valid())
							return false;
					$('#timbrar').val(0);
					$('#formFactura').submit();
                }
			},
            {
				text:"Guardar & timbrar",
				class:"btn btn-success",
                click:function(){
					$("#tabs").tabs({active:0});
						if(!$('#formFactura').valid())
							return false;
					$("#tabs").tabs({active:1});
						if(!$('#formFactura').valid())
							return false;
					$("#tabs").tabs({active:2});
						if(!$('#formFactura').valid())
							return false;
					$('#timbrar').val(1);
					$('#formFactura').submit();
                }
			}
		],
		close:function(){
			validator.resetForm();
			document.formFactura.reset();
			$(document.formFactura.id).val(0);
			$('#serie').val('');
			$('#folio').val('');
			$("#tabFacs").tabs("destroy");
			$('#gridConceptos').jqGrid('clearGridData');
			$("#col-iva").addClass("hide");
			$("#col-isr").addClass("hide");
			$("#col-iva input").attr("disabled",true);
			$("#col-isr input").attr("disabled",true);
			$("#grp-NumCtaPago").addClass("hide").removeClass("has-success");
			$("#NumCtaPago").attr("disabled",true);
			$.noty.closeAll();
			showMessageSys();
			$('.ui-dialog-buttonset').show();
			$('#gridIngresos').trigger( 'reloadGrid' );
		}
	});
	$("#dialog-email").dialog({
		autoOpen: false,
		width: 520,
		modal:true,
		dialogClass: 'panel panel-default',
		open: function(){
			clearTimeout($timeout);
			clearTimeout($gridtime);
		},
		buttons:[
			{
				text:"Cancelar",
                class:"btn btn-default",
                click:function () {
					$(this).dialog( "close" );
                }
            },
            {
				text:"Enviar",
                class:"btn btn-success",
                click:function (){
					$.post($(document.formEmail).attr( "action" ),$(document.formEmail).serialize()).done(function(data){
						if(data.result==true)
							msg('Correo enviado con <strong>exito</strong>','success');
						else
							msg('Servidor ocupado intentelo mas tarde','error');
						$body.removeClass("loading");
					}).fail(function(e){
						$.noty.closeAll();
						msg(e.status+": "+e.statusText,'error');
					});
					$(this).dialog('close');
				}
            }
        ],
		close:function(){
			$.noty.closeAll();
			showMessageSys();
			document.formEmail.reset();
			$('#diremail').val('');
			$('#msg').val('');
			$('#xmlfile').text('');
			$('#pdffile').text('');
			$('#gridIngresos').trigger( 'reloadGrid' );
			$('.ui-dialog-buttonset').show();
		}
	});
	//Facturas
	$('#addimport').bind("keypress",function(e){
		if(e.keyCode==13){
			additem();      
			e.preventDefault();
			return false;
		}
	}).click(function(){
		additem();
	});
	$('#cantidad').bind("keypress", function(e) {
		if (e.keyCode == 13) {
			$('#unidad').focus();   
			e.preventDefault();
			return false;
		}
	});
	$('#unidad').bind("keypress", function(e) {
		if (e.keyCode == 13) {
			$('#descripcion').focus();   
			e.preventDefault();
			return false;
		}
	});
	$('#descripcion').bind("keypress", function(e) {
		if (e.keyCode == 13) {
			$('#unitario').focus();   
			e.preventDefault();
			return false;
		}
	});
	$('#unitario').bind("keypress",function(e){
		if (e.keyCode == 13) {
			$('#addimport').focus();       
			e.preventDefault();
			return false;
		}
	});
	$("#tipo").change(function(){
		var $select = $(this).val();
		if($select=="FACTURA"){
			$("#col-iva").addClass("hide");
			$("#col-isr").addClass("hide");
			$("#col-iva input").attr("disabled",true);
			$("#col-isr input").attr("disabled",true);
		} else if($select=="RECIBOH"){
			$("#col-iva").removeClass("hide");
			$("#col-isr").removeClass("hide");
			$("#col-iva input").attr("disabled",false);
			$("#col-isr input").attr("disabled",false);
		}
		sumTotal()
	});
	$('#formFactura').bind("keypress", function(e) {
		if (e.keyCode == 13) {               
			e.preventDefault();
			return false;
		}
	});
	$('#metodo_pago').change(function(){
		var $val=$(this).val();
		if( $val == "TRANSFERENCIA BANCARIA" || $val == "CHEQUE" ){
			$("#grp-NumCtaPago").removeClass("hide").addClass("has-success");
			$("#NumCtaPago").attr("disabled",false);
		} else {
			$("#grp-NumCtaPago").addClass("hide").removeClass("has-success");
			$("#NumCtaPago").attr("disabled",true);
		}
	});
	$( "#rfc" ).autocomplete({
		source:function(request,response){
			$.post(base_url + 'catalogos/jsonContacSearch',{
				rfc:request.term,
				csrf_omadero:$.cookie('csrf_omadero')
			}).done(function(data){
				response( data );
			});
		},
		minLength:3,
		select: function(event,ui) {
			var $rfc = $("<div/>").html(ui.item.row.rfc).text();
			$(this).val($rfc);
			var $name = $("<div/>").html(ui.item.row.name).text();
			$('#nombre').val($name).text();
			if(ui.item.row.domicilioFiscal){
				var $d = $.parseJSON(ui.item.row.domicilioFiscal);
				var $dom = $("<div/>").html($d.calle + ' ' + $d.noExterior + ', ' + $d.colonia).text();
				$('#domicilio').val($dom);
				$('#domicilioFiscal').val(ui.item.row.domicilioFiscal);
			}
			return false;
		}
	});
	$('#codigo').autocomplete({
		source:function(request,response){
			$.post(base_url + 'catalogos/jsonStoreItemSearch',{
				word:$('#codigo').val(),
				csrf_omadero:$.cookie('csrf_omadero')
			}).done(function(data){
				response( data );
			});
		},
		minLength:3,
		select: function(event,ui){
			console.log(ui.item.row.unit);
			$('#unidad').val(ui.item.row.unit);
			console.log(ui.item.row.name);
			$('#descripcion').val(ui.item.row.name.replaceAll('->',' '));
			console.log(ui.item.row.price);
			$('#unitario').val(ui.item.row.price);
			$('#cantidad').focus();
			return false;
		}
	});
	$('#topdf > a').click(function(){
		var rowid = $("#gridIngresos").jqGrid('getGridParam','selrow'),
			rowdata;
		if( rowid != null ){
			rowdata = $("#gridIngresos").getRowData(rowid);
			document.sendto.uuid.value = rowdata.uuid;
			$($form).attr('action',base_url+'ingresos/showpdf');
			$($form).attr('target','_blank');
			$($form).submit();
			$($form).attr('target','_self');
			$($form).attr('action','');
			$('#dialog-opciones').dialog( "close" );
		}
	});
	$('#toedit > a').click(function(){
		var rowid = $("#gridIngresos").jqGrid('getGridParam','selrow'),
			rowdata;
		$('#dialog-opciones').dialog( "close" );
		if( rowid != null ){
			rowdata = $("#gridIngresos").getRowData(rowid);
			rowdata.factura = $.parseJSON(rowdata.factura);
			rowdata.impuestos = $.parseJSON(rowdata.impuestos);
			rowdata.receptor = $.parseJSON(rowdata.receptor);
			rowdata.receptor.DomJson = JSON.stringify(rowdata.receptor.Domicilio);
			$("form[name='formFactura'] input, form[name='formFactura'] select").each(function(key,val){
				if($(val).attr('name')=='id')
					$(val).val(rowid);
				else if($(val).attr('name')=='tipo'){
					if(typeof rowdata.impuestos.retenidos != 'undefined'){
						$(val).val('RECIBOH');
						$("#col-iva").removeClass("hide");
						$("#col-isr").removeClass("hide");
						$("#col-iva input").attr("disabled",false);
						$("#col-isr input").attr("disabled",false);
					} else $(val).val('FACTURA');
				} else if($(val).attr('name')=='factura[forma_pago]')
					$(val).val(rowdata.factura['forma_pago']);
				else if($(val).attr('name')=='factura[metodo_pago]'){
					$(val).val(rowdata.factura['metodo_pago']);
					if(rowdata.factura['metodo_pago'] == "TRANSFERENCIA BANCARIA" || 
					rowdata.factura['metodo_pago'] == "CHEQUE" ){
						$("#grp-NumCtaPago").removeClass("hide").addClass("has-success");
						$("#NumCtaPago").attr("disabled",false);
					} else {
						$("#grp-NumCtaPago").addClass("hide").removeClass("has-success");
						$("#NumCtaPago").attr("disabled",true);
					}
				} else if(typeof rowdata.factura['NumCtaPago'] != 'undefined' && $(val).attr('name')=='factura[NumCtaPago]')
					$(val).val(rowdata.factura['NumCtaPago']);
				else if($(val).attr('name')=='factura[serie]')
					$(val).val(rowdata.factura['serie']);
				else if($(val).attr('name')=='factura[folio]')
					$(val).val(rowdata.factura['folio']);
				else if(typeof rowdata.receptor['rfc'] != 'undefined' && $(val).attr('name')=='receptor[rfc]')
					$(val).val(rowdata.receptor['rfc']);
				else if(typeof rowdata.receptor['nombre'] != 'undefined' && $(val).attr('name')=='receptor[nombre]')
					$(val).val(rowdata.receptor['nombre']);
				else if(typeof rowdata.receptor['Domicilio'] != 'undefined' && rowdata.receptor['Domicilio']!=null && $(val).attr('name')=='domicilio'){
					$(val).val(rowdata.receptor.Domicilio['calle']+' '+rowdata.receptor.Domicilio['noExterior']+' '+rowdata.receptor.Domicilio['colonia']);
				} else if(typeof rowdata.receptor['DomJson'] != 'undefined' && $(val).attr('name')=='receptor[Domicilio]')
					$(val).val(rowdata.receptor.DomJson);
				else if($(val).attr('name')=='conceptos')
					$(val).val(rowdata.conceptos);
			});
			add();
		}
	});
	$('#tocancel > a').click(function(){
		$('#dialog-opciones').dialog( "close" );
		cancelar();
	});
	$('#toemail > a').click(function(){
		var rowid = $("#gridIngresos").jqGrid('getGridParam','selrow'),
			rowdata;
		$('#dialog-opciones').dialog( "close" );
		if( rowid != null ){
			rowdata = $("#gridIngresos").getRowData(rowid);
			rowdata.receptor = $.parseJSON(rowdata.receptor);
			var date = new Date(rowdata.fecha),
				year = date.getFullYear(),
				month = date.getMonth()+1,
				contacto = '', msg='';
			$.post(base_url + 'catalogos/jsonContacSearch',{
				rfc:rowdata.receptor.rfc,
				csrf_omadero:$.cookie('csrf_omadero')
			}).done(function(data){
				$(data).each(function($k,$v){
					if($v.row.email.length){
						if($('#diremail').val().length) $('#diremail').val(','+$v.row.email);
						else $('#diremail').val($v.row.email);
					}
					if($v.row.contacto.length) contacto = $v.row.contacto;
					else contacto = "amigo";
				});
				if(rowdata.uuid.length){
					$('#xmlfile').text(rowdata.uuid+'.xml');
					$('#pdffile').text(rowdata.uuid+'.pdf');
					$('#email_uuid').val(rowdata.uuid);
				} else {
					$('#xmlfile').text('sin XML');
					$('#pdffile').text('sin PDF');
					$('#email_uuid').val(0);
				}
				if(rowdata.status.toLowerCase()=="timbrada"){
					msg = 'Estimado '+contacto+':\n Anexo los archivos CFDI marcados por el SAT (XML), '+
					'para la comprobación de la factura electronica, así como su representación impresa en PDF.';
				} else if(rowdata.status.toLowerCase()=="cancelada") {
					msg = 'Estimado '+contacto+':\n Le escribo para informarle de la cancelación de la factura '+
					'con el numero de folio fiscal '+rowdata.uuid+'.';
				} else {
					msg = 'Estimado '+contacto+'\n';
				}
				$('#msg').val(msg);
				$('#dialog-email').dialog( "open" );
			}).fail(function(e){
				$.noty.closeAll();
				msg(e.status+": "+e.statusText,'error');
			});
		}
	});
});
function getMes(){
	var str = "";
	$("#varmes option:selected").each(function(){
		str += $( this ).text();
	});
	return str;
}
function getAnio(){
	var str = "";
	$("#varanio option:selected").each(function(){
		str += $( this ).text();
	});
	return str;
}
function add(){
	if($('#conceptos').val().length) var conceptos = $.parseJSON($('#conceptos').val());
	else var conceptos = new Object();
	$("#tabFacs").tabs({active:0});
	$('#dialog-form-factura').dialog('open');
	$("#gridConceptos").jqGrid({
		datatype: "local",
		height: 90,
		colNames:['Codigo','Cantidad', 'Unidad', 'Descripcion','Precio','Importe'],
		colModel:[
			{name:'ID',index:'ID', width:60},
			{name:'cantidad',index:'cantidad', width:40},
			{name:'unidad',index:'unidad', width:40},
			{name:'descripcion',index:'descripcion'},
			{name:'valorunitario',index:'valorunitario', width:70, align:"right",sorttype:"float"},
			{name:'importe',index:'importe', width:70,align:"right",sorttype:"float"}
		],
		gridComplete: function(){
			var fullData = $(this).jqGrid('getRowData');
			$("#conceptos").val(JSON.stringify(fullData));
			sumTotal();
		},
		ondblClickRow: function(rowid){
			var data = $(this).getRowData(rowid);
			$('#codigo').val(rowid);
			$('#cantidad').val(data.cantidad);
			$('#unidad').val(data.unidad);
			$('#descripcion').val(data.descripcion);
			$('#unitario').val(data.valorunitario);
			$(this).jqGrid('delRowData',rowid);
		}
	});
	$("#gridConceptos").jqGrid('setGridWidth',$("#tabs-3").width(),true);
	if(conceptos.length){
		for(var i=0;i<=conceptos.length;i++) 
			$("#gridConceptos").jqGrid('addRowData',i+1,conceptos[i]);
	}
}
function options(){
	var rowid = $("#gridIngresos").jqGrid('getGridParam','selrow'),
		rowdata;
	if( rowid != null ){
		rowdata = $("#gridIngresos").getRowData(rowid);
		$('#tosat').remove();
		if(rowdata.status.toLowerCase()=="timbrada"){
			$('#topdf').show();
			$('#topdf').attr('class','col-xs-3 col-md-3');
			$('#toemail').show();
			$('#toemail').attr('class','col-xs-3 col-md-3');
			$('#tozip').show();
			$('#tozip').attr('class','col-xs-3 col-md-3');
			$('#toedit').hide();
			$('#tocancel').show();
			$('#tocancel').attr('class','col-xs-3 col-md-3');
		} else if(rowdata.status.toLowerCase()=="cancelada"){
			$('<div/>', {
				class: 'col-xs-4 col-md-4',
				id: 'tosat',
				html: "<a href='#' class='thumbnail'><span class='glyphicon glyphicon-file' aria-hidden='true'></span>Comprobante SAT</a>"
			}).appendTo('div.bs-glyphicons').click(function(){
				document.sendto.uuid.value = rowdata.uuid;
				$($form).attr('action',base_url+'ingresos/report_cancel');
				$($form).attr('target','_black');
				$($form).submit();
				$($form).attr('target','_self');
				$($form).attr('action','');
				$('#dialog-opciones').dialog( "close" );
			});
			$('#topdf').show();
			$('#topdf').attr('class','col-xs-4 col-md-4');
			$('#toemail').show();
			$('#toemail').attr('class','col-xs-4 col-md-4');
			$('#tozip').hide();
			$('#toedit').hide();
			$('#tocancel').hide();
		} else {
			$('#topdf').show();
			$('#topdf').attr('class','col-xs-4 col-md-4');
			$('#toemail').show();
			$('#toemail').attr('class','col-xs-4 col-md-4');
			$('#tozip').hide();
			$('#toedit').show();
			$('#toedit').attr('class','col-xs-4 col-md-4');
			$('#tocancel').hide();
		}
		$('#dialog-opciones').dialog('open');
	} else msg("Selecciona una factura","warning");
}
function buscar(){
	$('#gridIngresos').jqGrid('searchGrid',{closeOnEscape:true,closeAfterSearch:true,
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
function cancelar(){
	var rowid = $("#gridIngresos").jqGrid('getGridParam','selrow'),
		rowdata;
	if(rowid){
		rowdata = $("#gridIngresos").getRowData(rowid);
		if(rowdata.status.toLowerCase()=='timbrada'){
			document.sendto.uuid.value = rowdata.uuid;
			$("#dialog-confirm").dialog('open');
		} else msg("Esta factura no esta registrada","warning");
	} else msg("Selecciona una factura","warning");
}
function sumTotal(){
	var parseImporte=  $("#gridConceptos").jqGrid('getCol','importe',false,'sum');
	$('#subtotal').val(parseImporte.toFixed(2));
	var traiva = parseImporte * (parseFloat($('#tra-iva-tasa').val())/100);
	$('#tra-iva').val(traiva.toFixed(2));
	var retiva = parseImporte * (parseFloat($('#ret-iva-tasa').val())/100);
	$('#ret-iva').val(retiva.toFixed(2));
	var retisr = parseImporte * (parseFloat($('#ret-isr-tasa').val())/100);
	$('#ret-isr').val(retisr.toFixed(2));
	var $total = parseImporte + traiva;
	var $select = $("#tipo").val();
	if($select=="RECIBOH")
		$total = $total - (retiva + retisr); 
    $('#total').val($total.toFixed(2));
}
function additem(){
	if(!$('#descripcion').val().length){
		msg('Este campo es requerido','warning');
		$('#descripcion').focus();
		return false;
	}
	if(!$('#codigo').val().length) $('#codigo').val('001');
	if(!$('#cantidad').val().length) $('#cantidad').val('1');
	if(!$('#unidad').val().length) $('#unidad').val('NO APLICA');
	if(!$('#unitario').val().length) $('#unitario').val(0);
	var $unitario = parseFloat($('#unitario').val());
		$unitario = $unitario/1.16;
		$unitario = $unitario.toFixed(2);
	var	$cantidad = parseFloat($('#cantidad').val()),
		$importe = $cantidad * $unitario,
		datarow = {
			ID:$('#codigo').val(),
			cantidad:$cantidad,
			unidad:$('#unidad').val(),
			descripcion:$('#descripcion').val(),
			valorunitario:$unitario,
			importe: $importe.toFixed(2)
		}; 
	var su=jQuery("#gridConceptos").jqGrid('addRowData',$('#codigo').val(),datarow);
	$('#codigo').val('');
	$('#cantidad').val('');
	$('#unidad').val($("#unidad option:first").val());
	$('#descripcion').val('');
	$('#unitario').val('');
	$('#codigo').focus();
}
