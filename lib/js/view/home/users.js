var $form;
$(function(){
	$form = $(document.formNew);
	var validator = $( $form ).validate({	//Validador del formulario
		rules:{
			username:{
				required: true,
				minlength: 5,
				maxlength: 25,
				pattern: function(){
					return $('#user').attr('pattern');
				}
			},
			pass:{
				required: true,
				minlength: 5,
				maxlength: 16,
				pattern: function(){
					return $('#pass').attr('pattern');
				}
			}
		},
		invalidHandler:function(event,valid){
			var errors = valid.numberOfInvalids();
			if (errors)
				valid.errorList[0].element.focus();
		},
		submitHandler: function(form){
			var pass = $('#pass').val();
			if(document.formNew.pass.value != document.formNew.passr.value){
				msg('La repeticion de la contraseña no coincide','warning');
				document.formNew.pass.value="";
				document.formNew.passr.value="";
				document.formNew.pass.focus();
				return false;
			}
			$('#pass').val($.md5(pass));
			$('#passr').val($.md5(pass));
			$.post($(form).attr( "action" ),$(form).serialize()).done(function(data){
				$('#pass').val(pass);
				if(data.result && data!=null){
					$("#dialog-form-new").dialog( "close" );
					$('#gridUsers').trigger( 'reloadGrid' );
				} else {
					showMessageSys();
					clearTimeout($timeout);
				}
			}).fail(function(e){
				$.noty.closeAll();
				msg(e.status+": "+e.statusText,'error');
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
	$("#gridUsers").jqGrid({
		url: base_url + 'home/jsonUsers',
		editurl: base_url + 'home/saveUser',
		datatype:"json",
		mtype:"POST",
		height: 280,
		colNames:['ID','Empleado','Nombre','Usuario','Tipo'], 
		colModel:[ 
			{name:'id',index:'id',width:20, sorttype:"integer",formatter:"integer",
				formatoptions:{thousandsSeparator:" ",defaultValue:'0'}},
			{name:'nemploy',index:'nemploy',width:40,sorttype:"string"},
			{name:'name',index:'name',width:0,sorttype:"string"},
			{name:'username',index:'username',width:40,sorttype:"string"},
			{name:'kindof',index:'kindof',width:40,sorttype:"string",search:false}
		],
		rowList:[10,12,15,20,100000000],
		multiselect: false,
		emptyrecords: "Sin usuarios",
		caption:"Lista de usuarios",
		pager:'#navgrid', 
		sortname:'name',
		gridComplete: function(){
			$("option[value=100000000]").text('Todos');
        },
        ondblClickRow: function(rowid) {
			edit();
        },
		loadError: function(xhr,status,error){
			msg(error,'warning');
		}
	});
	$("#gridUsers").jqGrid('navGrid',"#navgrid",{del:false,add:false,edit:false,search:false,refresh:false});
	$("#gridUsers").jqGrid('setGridWidth', $("#content").width()-20, true);
	$( "#dialog-form-new" ).dialog({
		autoOpen: false,
		modal: true,
		dialogClass: 'panel panel-default',
		width: 580,
		open: function(){
			clearTimeout($timeout);
		},
		buttons:[
			{
				text:"Cerrar",
                class:"btn btn-default",
                click:function(){
					$(this).dialog( "close" );
                }
            },
            {
				text:"Guardar",
				class:"btn btn-success",
                click:function(){
					$form.submit();
                }
			}
		],
		close:function(){
			$form[0].reset();
			$(document.formNew.oper).val('add');
			$(document.formNew.id).val(0);
			validator.resetForm();
			$.noty.closeAll();
			showMessageSys();
		}
	});
});
function buscar(){
	$('#gridUsers').jqGrid('searchGrid',{closeOnEscape:true,closeAfterSearch:true,
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
}
function edit(){
	var rowid = $("#gridUsers").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		var rowData = $("#gridUsers").getRowData(rowid);
		if(rowData.kindof == "ADMINISTRADOR")
			var $kindof=0;
		else if(rowData.kindof == "DOCTOR")
			var $kindof=1;
		else
			var $kindof=2;
		document.formNew.iduser.value = rowid;
		document.formNew.oper.value = 'edit';
		document.formNew.name.value = rowData.name;
		document.formNew.username.value = rowData.username;
		document.formNew.kindof.value = $kindof;
		add();
	} else msg("Selecciona una categoria para editar","warning");
}
function eliminar(){
	var rowid = $("#gridUsers").jqGrid('getGridParam','selrow');
	if( rowid != null ){
		$("#gridUsers").jqGrid('delGridRow',rowid,{reloadAfterSubmit:true,closeOnEscape:true,closeAfterDelete:true,
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
	} else msg("Selecciona una categoria","warning");
}
