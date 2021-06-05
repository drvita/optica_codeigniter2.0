var $form,$id,$gridtime,$b;
$(function(){
	$form = $(document.formNew);
	var c = new Object(),
		s = localStorage.getItem("contactos"),
		vtype = $("#typeclient").val(),
		validator = $( $form ).validate({	//Validador del formulario
		invalidHandler:function(event,valid){
			var errors = valid.numberOfInvalids();
			if (errors)
				valid.errorList[0].element.focus();
		},
		submitHandler: function(form){
			if($('#contacto').val().length<3){
				msg("Este campo es requerido","error");
				$("#tabs").tabs({active:0});
				$('#contacto').focus();
			} else if($('#rfc').val().length>9 && $('#name').val().length<4){
				msg("Este campo es requerido","error");
				$("#tabs").tabs({active:0});
				$('#name').focus();
			} else {
				$.post($(form).attr( "action" ),
					$(form).serialize()
				).done(function(data){
					if(typeof data.result != 'undefined'){
						$("#dialog-form-new").dialog( "close" );
						$('#gridContacs').trigger( 'reloadGrid' );
					}
				}).fail(function(){
					showMessageSys();
					$($b.target).html("<span class='glyphicon glyphicon-floppy-disk'></span> Guardar");
				});
			}
			return false;
		},
		showErrors:function(errorMap,errorList){
			$.noty.closeAll();
			$(errorList).each(function(i,n){
				msg(n.message,'warning');
			});
		}
	});
	$("input").tooltip();
	if(s==null){
		c = Object.create({jqgrid:{postData:{type:0}}});
	} else {
		c = $.parseJSON(s);
	}
	if(typeof c.jqgrid != 'undefined'){
		if(c.jqgrid.page==null) c.jqgrid.page = 1;
		if(c.jqgrid.rowNum==null) c.jqgrid.rowNum=50;
		else c.jqgrid.rowNum = Number(c.jqgrid.rowNum);
		c.jqgrid.postData={type:vtype};
		$("#typeclient").val(c.jqgrid.postData.type);
	} else {
		c = {
		jqgrid:{
			postData:{type:vtype},
			page:1,
			rowNum:50
			}
		}
	}
	//Cargador del grid
	$("#gridContacs").jqGrid({
		url: base_url + 'catalogos/jsonContacts',
		editurl: base_url + 'catalogos/saveContacto',
		postData:c.jqgrid.postData,
		colNames:['ID','Nombre','Domicilio','Email','Telefono','ID','Razon social','telnumber',
					'type','domicilioFiscal','rfc','domiciliopart','birthday'], 
		colModel:[ 
			{name:'id',index:'id',sorttype:"text",width:20},
			{name:'contacto',index:'contacto',sorttype:"text"},
			{name:'dm',index:'dm',sorttype:"text",width:120,search:false},
			{name:'email',index:'email',sorttype:"text",width:100},
			{name:'tel',index:'tel',sorttype:"text",width:40,search:false},
			{name:'id',index:'id',sorttype:"int",hidden:true,search:true,searchoptions:{searchhidden:true}},
			{name:'name',index:'name',sorttype:"text",hidden:true,search:true,searchoptions:{searchhidden:true}},
			{name:'telnumber',index:'telnumber',sorttype:"text",hidden:true},
			{name:'type',index:'type',sorttype:"int",hidden:true},
			{name:'domicilioFiscal',index:'domicilioFiscal',sorttype:"text",hidden:true},
			{name:'rfc',index:'rfc',sorttype:"text",hidden:true,search:true,searchoptions:{searchhidden:true}},
			{name:'domicilio',index:'domicilio',sorttype:"text",hidden:true},
			{name:'birthday',index:'birthday',sorttype:"date",hidden:true},
		],
		rowNum:c.jqgrid.rowNum,
		page:c.jqgrid.page,
		caption:"Listado de clientes y proveedores",
		sortname:'contacto',
		gridComplete: function(){
			$("option[value=100000000]").text('Todos');
            var gridInfo = new Object();
			gridInfo = {
			 jqgrid:{
				 page:$(this).jqGrid('getGridParam', 'page'),
				 rowNum:$(this).jqGrid('getGridParam', 'rowNum'),
				 postData:$(this).jqGrid('getGridParam', 'postData')
			 }
			}
			localStorage.setItem("contactos",JSON.stringify(gridInfo));
			if($gridtime) clearTimeout($gridtime);
			$gridtime = setTimeout(function(){$('#gridContacs').trigger('reloadGrid')},60000);
        }
	});
	$("#gridContacs").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridContacs").jqGrid('setGridWidth', $("#content").width()-10, true);
	$("#typeclient").change(function(){
		var vtype = $("#typeclient").val();
		$("#gridContacs").jqGrid("clearGridData", true);
		$('#gridContacs').setGridParam({postData:{type:vtype}});
        $('#gridContacs').trigger('reloadGrid');
	});
	//Ventana de dialogo
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		width: 720,
		position: 'top',
		open: function(){
			$.noty.closeAll();
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
					$("#tabs").tabs({active:0});
						if(!$form.valid())
							return false;
					$("#tabs").tabs({active:1});
						if(!$form.valid())
							return false;
					$("#tabs").tabs({active:2});
						if(!$form.valid())
							return false;
					$(b.target).text('Enviando ...');
					$form.submit();
                }
			}
		],
		close:function(){
			if(typeof $b != 'undefined') 
				$($b.target).html("<span class='glyphicon glyphicon-floppy-disk'></span> Guardar");
			document.formNew.reset();
			$(document.formNew.oper).val('add');
			$(document.formNew.id).val(0);
			validator.resetForm();
			$("#tabs").tabs("destroy");
			$.noty.closeAll();
			showMessageSys();
		}
	});
	$( "#calle" ).autocomplete({
		source:function(request,response){
			$.get("https://maps.googleapis.com/maps/api/geocode/json",{
				address: request.term,
				country: 'Mexico',
				sensor: "true"
			}).done(function(data){
				if(!data.status=="OK") return false;
				var map = new Array();
				$(data.results).each(function(k,v){
					map[k] = new Object();
					map[k].label = data.results[k].formatted_address;
					$(data.results[k].address_components).each(function(s,b){
						if(data.results[k].address_components[s].types[0]=="route")
							map[k].value = changetoutf8(data.results[k].address_components[s].long_name).toUpperCase();
					});
					map[k].row = data.results[k].address_components;
					if(k==10) return false;
				});
				response( map );
			});
		},
		minLength: 3,
		select:function(event,ui){
			$("form[name='formNew'] input[name ^= domicilio]").val("");
			$(ui.item.row).each(function(p,v){
				if(ui.item.row[p].types[0]=="street_number")
					$('#noExterior').val(ui.item.row[p].long_name.toUpperCase());
				else if(ui.item.row[p].types[0]=="neighborhood")
					$('#colonia').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="locality")
					$('#localidad').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="administrative_area_level_2")
					$('#municipio').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="administrative_area_level_1")
					$('#estado').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="country")
					$('#pais').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="postal_code")
					$('#CodigoPostal').val(parseInt(ui.item.row[p].long_name));
			});
		}
	});
	$( "#dmcalle" ).autocomplete({
		source:function(request,response){
			$.get("https://maps.googleapis.com/maps/api/geocode/json",{
				address: request.term,
				country: 'Mexico',
				sensor: "true"
			}).done(function(data){
				if(!data.status=="OK") return false;
				var map = new Array();
				$(data.results).each(function(k,v){
					map[k] = new Object();
					map[k].label = data.results[k].formatted_address;
					$(data.results[k].address_components).each(function(s,b){
						if(data.results[k].address_components[s].types[0]=="route")
							map[k].value = changetoutf8(data.results[k].address_components[s].long_name).toUpperCase();
					});
					map[k].row = data.results[k].address_components;
					if(k==10) return false;
				});
				response( map );
			});
		},
		minLength: 3,
		select:function(event,ui){
			$("form[name='formNew'] input[name ^= dm]").val("");
			$(ui.item.row).each(function(p,v){
				if(ui.item.row[p].types[0]=="street_number")
					$('#dmnoExterior').val(ui.item.row[p].long_name.toUpperCase());
				else if(ui.item.row[p].types[0]=="neighborhood")
					$('#dmcolonia').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="locality")
					$('#dmlocalidad').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="administrative_area_level_2")
					$('#dmmunicipio').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="administrative_area_level_1")
					$('#dmestado').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="country")
					$('#dmpais').val(changetoutf8(ui.item.row[p].long_name).toUpperCase());
				else if(ui.item.row[p].types[0]=="postal_code")
					$('#dmCodigoPostal').val(parseInt(ui.item.row[p].long_name));
			});
		}
	});
	/*
	$("#birthday").datepicker({
		changeMonth: true,
		changeYear: true,
		yearRange: "-100:+0",
		dateFormat: "yy-mm-dd"
	});
	*/
});
function buscar(){
	$('#gridContacs').jqGrid('searchGrid',{closeOnEscape:true,closeAfterSearch:true,
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
	$("#tabs").tabs({active:0});
	$id = parseInt($(document.formNew.id).val());
	if(!$id)
		$('#type').val($('#typeclient').val());
	$('#rfc').focus();
	$('#dialog-form-new').dialog('open');
	$('#dialog-form-new').removeClass('hide');
}
function edit(){
	var rowid = $("#gridContacs").jqGrid('getGridParam','selrow'),
		rowdata,telnumber,telnumbername,domicilioFiscal,domicilioname;
	if(rowid=="1000" || rowid=="1001"){
		msg("Este contacto no puede ser modificado",'warning');
		return false;
	}
	if( rowid != null ){
		rowdata = $("#gridContacs").getRowData(rowid);
		if(!rowdata.domicilioFiscal.length) rowdata.domicilioFiscal = new Object();
		else rowdata.domicilioFiscal = JSON.parse(rowdata.domicilioFiscal);
		if(!rowdata.domicilio.length) rowdata.domicilio = new Object();
		else rowdata.domicilio = JSON.parse(rowdata.domicilio);
		if(!rowdata.telnumber.length) rowdata.telnumber = new Object();
		else rowdata.telnumber = JSON.parse(rowdata.telnumber);
		$("form[name='formNew'] input, form[name='formNew'] select").each(function(key,val){
			if(typeof rowdata[$(val).attr('name')] != 'undefined')
				$(val).val(rowdata[$(val).attr('name')]);
			else {
				telnumber=$(val).attr('name').split('telnumber');
				if(telnumber.length==2){
					telnumbername = telnumber[1].replace("[","").replace("]","");
					$(val).val(rowdata.telnumber[telnumbername]);
				}
				domicilioFiscal=$(val).attr('name').split('domicilio');
				if(domicilioFiscal.length==2){
					domicilioname = domicilioFiscal[1].replace("[","").replace("]","");
					$(val).val(rowdata.domicilioFiscal[domicilioname]);
				}
				domicilio=$(val).attr('name').split('dm');
				if(domicilio.length==2){
					domicilioname = domicilio[1].replace("[","").replace("]","");
					$(val).val(rowdata.domicilio[domicilioname]);
				}
			}
			if($(val).attr('name')=="oper")
				$(val).val('edit');
		});
		add();
	} else msg("Selecciona un contacto primero","warning");
}
function eliminar(){
	var rowid = $("#gridContacs").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		if(rowid=="XAXX010101000"){
			msg("Este contacto no puede ser eliminado",'warning');
			return false;
		}
		$("#gridContacs").jqGrid('delGridRow',rowid,{reloadAfterSubmit:true,closeOnEscape:true,closeAfterDelete:true,
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
		onclickSubmit:function(){
            return {csrf_omadero:$.cookie('csrf_omadero')};
        }});
	} else msg("Selecciona un contacto","warning");
}
