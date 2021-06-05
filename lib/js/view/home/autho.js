$(function(){
	var form = document.formAutho,
	validator = $(form).validate({	//Validador del formulario
		rules:{
			user:{
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
		messages: {
			user: "El usuario tiene caracteres no permitidos",
			pass: "El password tiene caracteres no permitidos"
		},
		invalidHandler:function(event,valid){
			var errors = valid.numberOfInvalids();
			if (errors)
				valid.errorList[0].element.focus();
		},
		submitHandler: function(form){
			var pass = $('#pass').val();
			$('#pass').val($.md5(pass));
			$.post($(form).attr( "action" ),
				$(form).serialize()
			).done(function(data){
				$body.addClass("loading");
				$('#pass').val(pass);
				if(typeof data.next != "undefined" && data.next.length && data.next != 'home/autho'){
					$noexit=false;
					document.location.href=base_url+data.next
				} else {
					$('#pass').val('');
					$body.removeClass("loading");
					showMessageSys();
					clearTimeout($timeout);
				}
			}).error(function(err){
				$('#pass').val(pass);
			});
		},
		showErrors:function(errorMap,errorList){
			$.noty.closeAll();
			$(errorList).each(function(i,n){
				msg(n.message,'warning');
			});
		}
	});
	$('#user').focus();
});
