$(function(){
	var series1 = {
			type: "column",
			name: "Ventas",
			showInLegend: true,
			legendText: "Metodos de pagos",
			dataPoints:[]
		},
		chart = new CanvasJS.Chart("chartContainer",{
			animationEnabled: true,
			axisY: {
				title: "Pesos MXN"
			}
		}),
		cash = $('#sale-cash').val(),total=0;
	series1.dataPoints = $.parseJSON($('#ventas_metodos').val());
	for(i in series1.dataPoints){
		if(typeof series1.dataPoints[i]!='object') continue;
		series1.dataPoints[i].y = parseFloat(series1.dataPoints[i].y);
		if(series1.dataPoints[i].label=='EFECTIVO'){
			total = series1.dataPoints[i].y - cash;
			if(total > 0) $('#sale-cash').css('color','red');
			else if(total < 0) $('#sale-cash').css('color','blue');
			$('#sale-cash').val(total);
		}
	}
	chart.options.data = [];
	chart.options.data.push(series1);
	chart.render();
	$("#date").datepicker({
		dateFormat: "yy-mm-dd"
	}).change(function(){
		$noexit=false;
		$('#form-fecha').submit();
	});
});
