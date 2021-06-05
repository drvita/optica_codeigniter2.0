<?php 
header('Content-type: application/ms-excel');
header('Content-Disposition: attachment; filename=lentes_mono.csv');

$fp = fopen('php://output', 'w');
fputcsv($fp,array("name","default_code","type","categ_id","price","Product Attributes/Attribute/ID","Product Attributes/Attribute/values_ids"));
$g="";

for ($i = -6; $i <= 6; $i+=0.25) {
	for ($j = 0; $j <= 2; $j+=0.25) { 
		if(empty($g)) $g="[$i/$j]";
		else $g.=",[$i/$j]";
	} 
}
fputcsv($fp,array("Monofocal Plastico Blanco ","MOCRBL".($i*100).($j*100),"Almacenable","Lentes","360","Graduacion","$g"));
fclose($fp);
