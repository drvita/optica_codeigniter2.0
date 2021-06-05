<?php 
header('Content-type: application/ms-excel');
header('Content-Disposition: attachment; filename=lentes_atributos.csv');

$fp = fopen('php://output', 'w');
fputcsv($fp,array("attribute_id","name"));

for ($i = -6; $i <= 6; $i+=0.25) {
	for ($j=0; $j <= 2; $j+=0.25) {
		fputcsv($fp,array("Graduacion","[$i/$j]"));
	} 
}
fclose($fp);
