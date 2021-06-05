<?php
	header("Content-Type: text/html; charset=utf-8");
?>
<html>
	<head>
		<title>Examnes de omadero</title>
		<style>
		body {
			text-transform: lowercase;
		}
		label {
			text-transform: capitalize;
		}
		</style>
	</head>
	<body>
<?php

	$usuario = "root";
	$password = "Optica.madero";
	$servidor = "localhost";
	$basededatos = "omadero";
	
	// creación de la conexión a la base de datos con mysql_connect()
	$conexion = mysqli_connect( $servidor, $usuario, $password, $basededatos ) or die ("No se ha podido conectar al servidor mysql");
	$exep = "";
	// establecer y realizar consulta. guardamos en variable.
	$consulta = "SELECT c.id as idc,e.* FROM examenes AS e LEFT JOIN contactos AS c ON e.idclient=c.id WHERE c.id !='' LIMIT 8001,9000";
	$resultado = mysqli_query( $conexion, $consulta ) or die ( "Algo ha ido mal en la consulta a la base de datos");
	
		
	// Motrar el resultado de los registro de la base de datos
	// Encabezado de la tabla
	echo "<table border='2'>";
	echo "<tr>";
		echo "<th>ID externo</th>";
		echo "<th>Inicio</th>";
		echo "<th>Estado</th>";
		echo "<th>Paciente</th>";
		echo "<th>AV Ambos ojos</th>";
		echo "<th>AV C/graduacion derecho</th>";
		echo "<th>AV C/graducion izquierdo</th>";
		echo "<th>AV Final derecho</th>";
		echo "<th>AV Final izquierdo</th>";
		echo "<th>AV S/lentes derecho</th>";
		echo "<th>AV S/lentes izquierdo</th>";
		echo "<th>Adicion derecho</th>";
		echo "<th>Adicion izquierdo</th>";
		echo "<th>Altura derecho</th>";
		echo "<th>Altura izquierda</th>";
		echo "<th>Antecedentes familiares</th>";
		echo "<th>Antecedentes personales</th>";
		echo "<th>CV derecho</th>";
		echo "<th>CV izquierdo</th>";
		echo "<th>Cefalea</th>";
		echo "<th>Cilindro derecho</th>";
		echo "<th>Cilindro izquierdo</th>";
		echo "<th>DP derecho</th>";
		echo "<th>DP izquierdo</th>";
		echo "<th>Diagnostico</th>";
		echo "<th>Eje derecho</th>";
		echo "<th>Eje izquierdo</th>";
		echo "<th>Esfera derecho</th>";
		echo "<th>Esfera izquierdo</th>";
		echo "<th>Fotocoagulacion derecho</th>";
		echo "<th>Fotocoagulación izquierdo</th>";
		echo "<th>Frecuencia de cefalia</th>";
		echo "<th>Frontal</th>";
		echo "<th>General</th>";
		echo "<th>Intencidad de cefalea</th>";
		echo "<th>Interrogatorio</th>";
		echo "<th>Keratometria derecha</th>";
		echo "<th>Keratometria izquierda</th>";
		echo "<th>LC Marca</th>";
		echo "<th>LC Ojo derecho</th>";
		echo "<th>LC Ojo izquierdo</th>";
		echo "<th>Observaciones</th>";
		echo "<th>Occipital</th>";
		echo "<th>Oftalmoscopia</th>";
		echo "<th>Pantalleo derecho</th>";
		echo "<th>Pantalleo izquierdo</th>";
		echo "<th>Presbicie</th>";
		echo "<th>Rango de glucosa</th>";
		echo "<th>Retinoscopia derecho</th>";
		echo "<th>Retinoscopia izquierdo</th>";
		echo "<th>Temporal derecho</th>";
		echo "<th>Temporal izquierdo</th>";
		echo "<th>Tension Ocular derecho</th>";
		echo "<th>Tension Ocular izquierdo</th>";
		echo "<th>Tiempo de uso PC</th>";
		echo "<th>Tiempo de uso laptop</th>";
		echo "<th>Tiempo de uso tablet</th>";
		echo "<th>Tiempo de uso telefono</th>";
		echo "<th>Tx oftamologico</th>";
		echo "<th>¿Utiliza el telefono mobil?</th>";
		echo "<th>¿Utiliza la PC?</th>";
		echo "<th>¿Utiliza la laptop?</th>";
		echo "<th>¿Utiliza la tablet?</th>";
	echo "</tr>";
	
	// Bucle while que recorre cada registro y muestra cada campo en la tabla.
	while ($col = mysqli_fetch_array( $resultado ))
	{
		switch ($col['c_intensidad']) {
			case 0:
				$col['c_intensidad']="Nula";
				break;
			case 1:
				$col['c_intensidad']="Nula";
				break;
			case 2:
				$col['c_intensidad']="Baja";
				break;
			case 3:
				$col['c_intensidad']="Media";
				break;
			default:
				$col['c_intensidad']="Alta";
		}
		echo "<tr>";
			
			echo "<td>". $col['id'] . "</td>";
			echo "<td>". $col['date'] . "</td>";
			echo ($col['status']=='0')?"<td><label>En proceso</label></td>":"<td><label>Terminado</label></td>";
			echo "<td>". $col['idclient'] ."</td>";
			echo "<td>". $col['avf2o'] . "</td>";
			echo "<td>". $col['avcgaod'] . "</td>";
			echo "<td>". $col['avcgaoi'] . "</td>";
			echo "<td>". $col['avfod'] ."</td>";
			echo "<td>". $col['avfoi'] . "</td>";
			echo "<td>". $col['avslod'] . "</td>";
			echo "<td>". $col['avsloi'] . "</td>";
			echo "<td>". $col['adiciond'] . "</td>";
			echo "<td>". $col['adicioni'] . "</td>";
			echo "<td>". $col['alturaod'] . "</td>";
			echo "<td>". $col['alturaoi'] . "</td>";
			echo "<td>". $col['aopf'] . "</td>";
			echo "<td>". $col['aopp'] . "</td>";
			echo "<td>". $col['cvod'] . "</td>";
			echo "<td>". $col['cvoi'] . "</td>";
			echo ($col['cefalea']=='0')?"<td>no</td>":"<td>si</td>";
			echo "<td>". $col['cilindrod'] . "</td>";
			echo "<td>". $col['cilindroi'] . "</td>";
			echo "<td>". $col['dpod'] . "</td>";
			echo "<td>". $col['dpoi'] . "</td>";
			echo "<td>". $col['diagnostico'] . "</td>";
			echo "<td>". $col['ejeod'] . "</td>";
			echo "<td>". $col['ejeoi'] . "</td>";
			echo "<td>". $col['esferaod'] . "</td>";
			echo "<td>". $col['esferaoi'] . "</td>";
			echo ($col['d_fclod']=='0')?"<td>no</td>":"<td>si</td>";
			echo ($col['d_fcloi']=='0')?"<td>no</td>":"<td>si</td>";
			echo "<td>". $col['c_frecuencia'] . "</td>";
			echo ($col['frontal']=='0')?"<td>no</td>":"<td>si</td>";
			echo ($col['generality']=='0')?"<td>no</td>":"<td>si</td>";
			echo "<td>". $col['c_intensidad'] . "</td>";
			echo "<td>". $col['interrogatorio'] . "</td>";
			echo "<td>". $col['keratometriaod'] . "</td>";
			echo "<td>". $col['keratometriaoi'] . "</td>";
			echo "<td>". $col['lcmarca'] . "</td>";
			echo "<td>". $col['lcgod'] . "</td>";
			echo "<td>". $col['lcgoi'] . "</td>";
			echo "<td>". $col['observaciones'] . "</td>";
			echo ($col['occipital']=='0')?"<td>no</td>":"<td>si</td>";
			echo "<td>". $col['oftalmoscopia'] . "</td>";
			echo "<td>". $col['pantalleood'] . "</td>";
			echo "<td>". $col['pantalleooi'] . "</td>";
			echo ($col['presbicie']=='0')?"<td>no</td>":"<td>si</td>";
			echo "<td>". $col['d_media'] . "</td>";
			echo "<td>". $col['rsod'] . "</td>";
			echo "<td>". $col['rsoi'] . "</td>";
			echo ($col['temporaod']=='0')?"<td>no</td>":"<td>si</td>";
			echo ($col['temporaoi']=='0')?"<td>no</td>":"<td>si</td>";
			echo "<td>". $col['piod'] . "</td>";
			echo "<td>". $col['pioi'] . "</td>";
			echo "<td>". $col['pc_time'] . "</td>";
			echo "<td>". $col['lap_time'] . "</td>";
			echo "<td>". $col['tablet_time'] . "</td>";
			echo "<td>". $col['movil_time'] . "</td>";
			echo "<td>". $col['txoftalmico'] . "</td>";
			echo ($col['movil']=='0')?"<td>no</td>":"<td>si</td>";
			echo ($col['pc']=='0')?"<td>no</td>":"<td>si</td>";
			echo ($col['lap']=='0')?"<td>no</td>":"<td>si</td>";
			echo ($col['tablet']=='0')?"<td>no</td>":"<td>si</td>";
		
		echo "</tr>";
	}
	
	echo "</table>"; // Fin de la tabla

	// cerrar conexión de base de datos
	mysqli_close( $conexion );
?>
	</body>
</html>
