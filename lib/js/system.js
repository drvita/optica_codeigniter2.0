var $messages,$timeout,$session,$noexit=true,$body = $("#htmlContent"),$hwin=$( window ).height()/10;
$(function(){
	var	htmlBefore = $('.well.well-sm').html(),
		htmlAfter = '<img src="'+base_url+'lib/images/logo_oa_small.png" title="openAdmin" class="img-responsive"/>' + htmlBefore;
	$hwin=$( document ).height()/10;
	$body = $("#htmlContent");
	$('a').click(function(e){
		$noexit=false;
	});
	$(window).mousedown(function(e){
		if (e.which === 3) document.oncontextmenu = function() {return false;};
	}).ajaxStart(function(){
		$body.addClass("loading"); 
	}).ajaxComplete(function(){ 
		$body.removeClass("loading"); 
	}).ajaxError(function(status,xhr,error){
		$.noty.closeAll();
		debug_error(xhr,status,error);
	});
	$('#sectionContent').resize(function(){
		if(window.jQuery.jgrid){
			$("table[id^='grid']").each(function(i,tb){
				$("div[id^='gbox_grid']").each(function(i,el) {
					$(tb).jqGrid('setGridWidth',$($(el).parent()[0]).width(),true);
				});
			});
		}
	});
	window.onbeforeunload = function(e) {
		//var url = e.target.URL.toLocation().protocol + '//' + e.target.URL.toLocation().hostname + '/';
		if($noexit) return 'Esta seguro que quiere salir del sistema?';
		$noexit = true;
	};
	if (window.jQuery.validator){
		var newscript = document.createElement('script');
		newscript.type = 'text/javascript';
		newscript.async = true;
		newscript.src = base_url+'lib/js/additional-methods.min.js';
		(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(newscript);
		$.extend($.validator.messages,{
			pattern:"Estructura no valida",
			required: "Este campo es obligatorio.",
			remote: "Por favor, rellena este campo.",
			email: "Por favor, escribe una dirección de correo válida.",
			url: "Por favor, escribe una URL válida.",
			date: "Por favor, escribe una fecha válida.",
			dateISO: "Por favor, escribe una fecha (ISO) válida.",
			number: "Por favor, escribe un número válido.",
			digits: "Por favor, escribe sólo dígitos.",
			creditcard: "Por favor, escribe un número de tarjeta válido.",
			equalTo: "Por favor, escribe el mismo valor de nuevo.",
			extension: "Por favor, escribe un valor con una extensión aceptada.",
			maxlength: $.validator.format("Por favor, no escribas más de {0} caracteres."),
			minlength: $.validator.format("Por favor, no escribas menos de {0} caracteres."),
			rangelength: $.validator.format("Por favor, escribe un valor entre {0} y {1} caracteres."),
			range: $.validator.format("Por favor, escribe un valor entre {0} y {1}."),
			max: $.validator.format("Por favor, escribe un valor menor o igual a {0}."),
			min: $.validator.format("Por favor, escribe un valor mayor o igual a {0}."),
			nifES: "Por favor, escribe un NIF válido.",
			nieES: "Por favor, escribe un NIE válido.",
			cifES: "Por favor, escribe un CIF válido."
		});
		$.validator.setDefaults({
			onkeyup: false,
			onclick: false,
			focusInvalid: false,
			invalidHandler:function(event,valid){
				$(valid.errorList[0].element).focus();
			},
			showErrors: function(element,list){
				$.noty.closeAll();
				$(list).each(function(k,e){
					msg(e.message+' en '+$(e.element).attr('name')+' por '+e.method,'warning');
				});
			}
		});
	}
	if(window.jQuery.jgrid){
		$.extend($.jgrid.defaults,{
			mtype:"POST",
			height: $hwin*6,
			datatype:"json",
			rowList:[10,12,15,20,50,100000000],
			rowNum:50,
			multiselect: false,
			emptyrecords: "Sin registros",
			pager:'#navgrid', 
			ajaxGridOptions:{
				beforeSend: function(jqXHR,settings){
					settings.data+="&csrf_omadero="+$.cookie('csrf_omadero');
				}
			},
			onRightClickRow: function(){
				var grid = $(this),vedit=true,vadd=true,vbuscar=true,veliminar=true,vprint=true;
				if (typeof edit == 'function') vedit=false;
				if (typeof add == 'function') vadd=false;
				if (typeof buscar == 'function') vbuscar=false;
				if (typeof eliminar == 'function') veliminar=false;
				if (typeof printed == 'function') vprint=false;
				$(this).contextmenu({
					delegate: grid,
					menu: [
						{title: "Editar", cmd: "edit", uiIcon: "ui-icon-pencil",disabled:vedit},
						{title: "Nuevo", cmd: "new", uiIcon: "ui-icon-plus",disabled:vadd},
						{title: "Imprimir", cmd: "printed", uiIcon: "ui-icon-print",disabled:vprint},
						{title: "Buscar", cmd: "search", uiIcon: "ui-icon-search",disabled:vbuscar},
						{title: "Eliminar", cmd: "delete", uiIcon: "ui-icon-trash",disabled:veliminar}
					],
					select: function(event, ui) {
						if(ui.cmd=='edit') edit();
						if(ui.cmd=='new') add();
						if(ui.cmd=='search') buscar();
						if(ui.cmd=='delete') eliminar();
						if(ui.cmd=='printed') printed();
					}
				});
			},
			gridComplete: function(){
				$("option[value=100000000]").text('Todos');
			},
			ondblClickRow: function(rowid) {
				edit();
			}
		});
		$.jgrid.extend({
	        exportarExcel: function (o){
	            var archivoExporta, hojaExcel;
	            archivoExporta = {
	                worksheets: [
	                    []
	                ],
	                creator: "Openadmin",
	                created: new Date(),
	                lastModifiedBy: "Openadmin",
	                modified: new Date(),
	                activeWorksheet: 0
	            };
	            hojaExcel = archivoExporta.worksheets[0];
	            hojaExcel.name = o.nombre;
	 
	            var arrayCabeceras = new Array();
	            arrayCabeceras = $(this).getDataIDs();
	            var dataFilaGrid = $(this).getRowData(arrayCabeceras[0]);
	            var nombreColumnas = new Array();
	            var ii = 0;
	            for (var i in dataFilaGrid) {
	                nombreColumnas[ii++] = i;
	            }
	            hojaExcel.push(nombreColumnas);
	            var dataFilaArchivo;
	            for (i = 0; i < arrayCabeceras.length; i++) {
	                dataFilaGrid = $(this).getRowData(arrayCabeceras[i]);
	                dataFilaArchivo = new Array();
	                for (j = 0; j < nombreColumnas.length; j++) {
	                    dataFilaArchivo.push(dataFilaGrid[nombreColumnas[j]]);
	                }
	                hojaExcel.push(dataFilaArchivo);
	            }
	            $noexit=false;
	            return window.location = xlsx(archivoExporta).href();
	        }
	    });
	}
	if(window.jQuery.datepicker){
		$.datepicker.regional['es'] = {
			clearText: 'Borrar', clearStatus: '',closeText: 'Cerrar', closeStatus: 'Cerrar sin cambiar',
			prevText: '<Previo', prevStatus: 'Mes anterior',nextText: 'Siguiente>', nextStatus: 'Mes siguiente',
			currentText: 'Hoy', currentStatus: 'Mes actual',
			monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
			monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
			monthStatus: 'Otros meses', yearStatus: 'Otro año',weekHeader: 'Sm', weekStatus: '',
			dayNames: ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
			dayNamesShort: ['Dom','Lun','Mar','Mir','Jue','Vie','Sab'],
			dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sa'],
			dayStatus: 'Utilice DD como primer dia de la semana', dateStatus: 'Elija Día y mes',
			dateFormat: 'yy/mm/dd', firstDay: 0, 
			initStatus: 'Elija la fecha', isRTL: false
		};
		$.datepicker.setDefaults($.datepicker.regional['es']);
	}
	showMessageSys();
	$("input[type='number']").focus(function(){
		var val = parseInt($(this).val());
		if(val==0) $(this).val('');
	}).blur(function(){
		var val = $(this).val();
		if(!val.length) $(this).val(0);
	});
});
//Muestra errores
function debug_error(xhr,status,error){
	var txt,server;
	if(xhr.status!=200&&xhr.readyState!=4){
		txt='<strong>Debug system:</strong><br/>'+xhr.status+' - '+xhr.statusText;
		server=$(xhr.responseText).filter('div#container').html();
		if(typeof server != 'undefined' && server.length) txt+='<br/><small>'+server+'</small>';
	} else {
		txt='<strong>Debug system:</strong><br/>Error interno en los controladores.';
	}
	msg(txt,'error');
}
function opendebugerror(){
	msg($server,'information');
}
//Muestra los mensades de sistema
function showMessageSys(){
	$.post(base_url+'home/getmessage',{
		csrf_omadero:$.cookie('csrf_omadero')
	}).done(function(data){
		if(data.records)
			for(var i in data.messages)
				msg(data.messages[i].message,data.messages[i].type);
	}).always(function(data,path){
		if(typeof data.session!='undefined') $session=data.session;
		else $session=0;
		if($timeout) clearTimeout($timeout);
		if($session) $timeout=setTimeout(showMessageSys,60000);
		$body.removeClass("loading");
		if(!$session){
			if(document.URL!=base_url+"home/autho" && path=='success'){
				$noexit=false;
				document.location.href = base_url+"home/autho";
			} else if($timeout) clearTimeout($timeout);
		}
	});
	if(document.URL!=base_url+"home/autho"){
		$.post(base_url+'catalogos/jsonContacts',{
			rows:3,
			sidx:'id',
			sord:'DESC',
			csrf_omadero:$.cookie('csrf_omadero')
		}).done(function(data){
			var htmlstring='';
			$('#user-last').empty();
			if(data.records){
				for(i in data.rows){
					if(typeof data.rows[i]!='object') continue;
					htmlstring += '<li><a href="javascript:void(0)"><h3>'+
					'<span class="glyphicon glyphicon-user"></span> '+data.rows[i].cell.contacto+
					'<small class="pull-right">'+data.rows[i].id+'</small></h3></a></li>';
				}
				$('#user-last').html(htmlstring);
			}
		});
	}
}
//Despliega las notificaciones
function msg($text,$type){
	if (typeof($text) == "undefined") return false;
	if($type==null) $type='alert';
	if($type=='error'){
		$text="<div class='activity-item'><span class='glyphicon glyphicon-warning-sign'></span><div class='activity'> "+$text+" </div></div>";
	} else if($type=='warning' || $type=='information' || $type=='alert' || $type=='notification'){
		$text="<div class='activity-item'><span class='glyphicon glyphicon-exclamation-sign'></span><div class='activity'> "+$text+" </div></div>";
	} else if($type=='success'){
		$text="<div class='activity-item'><span class='glyphicon glyphicon-check'></span><div class='activity'> "+$text+" </div></div>";
	}
	var messages = noty({
		text: $text,
		theme: 'relax',
		layout: 'topCenter',
		type: $type,
    	maxVisible: 6,
    	modal: false,
    	timeout: 20000,
    	animation:{
			open  : 'animated bounceInLeft',
            close : 'animated bounceOutRight',
            easing: 'swing',
            speed : 500
		}
	});
}
//Despliega las confirmaciones
function confirm($text,$buttons){
	var messages = noty({
		text: $text,
		theme: 'relax',
		layout: 'bottomCenter',
		type: 'confirm',
    	maxVisible: 5,
    	modal: true,
    	killer: true,
    	dismissQueue: true,
    	buttons: $buttons,
    	animation:{
			open  : 'animated bounceInLeft',
            close : 'animated bounceOutRight',
            easing: 'swing',
            speed : 500
		}
	});
}
function buttonoutsystem(){
	confirm('Confirme que desea <strong>SALIR</strong> del sistema.',[
			{
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
					document.location.href=base_url+'home/logout';
				}
			}
		]);
}
function panel_lastCustom(){
	var hpanel=$( '#plastcustom' ).height(),
		pos = parseInt( $( '#plastcustom' ).css('bottom') );
	if(pos==-145) pos=-20;
	else pos=-145;
	 $( "#plastcustom" ).animate({
		bottom: pos,
	},1000);
}
function changetoutf8(text){
    var text = text.toLowerCase(); // a minusculas
    text = text.replace(/[áàäâå]/, 'a');
    text = text.replace(/[éèëê]/, 'e');
    text = text.replace(/[íìïî]/, 'i');
    text = text.replace(/[óòöô]/, 'o');
    text = text.replace(/[úùüû]/, 'u');
    text = text.replace(/[ýÿ]/, 'y');
    text = text.replace(/[ñ]/, 'n');
    text = text.replace(/[ç]/, 'c');
    //text = text.replace(/['"]/, '');
    //text = text.replace(/[^a-zA-Z0-9-]/, ''); 
    //text = text.replace(/\s+/, '-');
    //text = text.replace(/' '/, '-');
    //text = text.replace(/(_)$/, '');
    //text = text.replace(/^(_)/, '');
    return text;
}
Array.prototype.remove = function(index){
    delete this[index];
    return this;
};
Array.prototype.clean = function(){
    var arr1 = this, arr2 = [];
    for(var a in arr1){
        if(arr1[a]&&arr1.hasOwnProperty(a)){
            arr2.push(arr1[a]);
        }
    }
    this.splice(0);
    for(var b in arr2){
        if(arr2.hasOwnProperty(b)){
            this.push(arr2[b]);
        }
    }
    return this;
};
String.prototype.replaceAll = function(search,newstring){
    var out = this.replace(new RegExp(search,'g'), newstring);
    return out;
};
String.prototype.replaceArray = function(find,replace) {
  var replaceString = this;
  for (var i = 0; i < find.length; i++) {
    replaceString = replaceString.replace(new RegExp(find[i],'g'), replace[i]);
  }
  return replaceString;
};
String.prototype.toLocation = function() {
    var a = document.createElement('a');
    a.href = this;
    return a;
};
String.prototype.pad = function(str,max){
	var replaceString = this.toString();
	if(replaceString.length < max){
		for(i=replaceString.length;i<max;i++)
			replaceString = str+''+replaceString;
	}
	return  replaceString;
}
