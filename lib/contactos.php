<?php
	header("Content-Type: text/html; charset=utf-8");
	$usuario = "root";
	$password = "Optica.madero";
	$servidor = "localhost";
	$basededatos = "omadero";
	
	// creación de la conexión a la base de datos con mysql_connect()
	$conexion = mysqli_connect( $servidor, $usuario, $password, $basededatos ) or die ("No se ha podido conectar al servidor mysql");
	
	// establecer y realizar consulta. guardamos en variable.
	$consulta = "SELECT * FROM `contactos` LIMIT 12001,13000";
	$resultado = mysqli_query( $conexion, $consulta ) or die ( "Algo ha ido mal en la consulta a la base de datos");
	
		
	// Motrar el resultado de los registro de la base de datos
	// Encabezado de la tabla
	echo "<table border='2'>";
	echo "<tr>";
		echo "<th>External ID</th>";
		echo "<th>name</th>";
		echo "<th>email</th>";
		echo "<th>Telefono</th>";
		echo "<th>Movil</th>";
		echo "<th>Calle</th>";
		echo "<th>Calle2</th>";
		echo "<th>C.P.</th>";
		echo "<th>Es una compania</th>";
		echo "<th>NIF</th>";
	echo "</tr>";
	
	// Bucle while que recorre cada registro y muestra cada campo en la tabla.
	while ($col = mysqli_fetch_array( $resultado ))
	{
		$tt = json_decode($col['telnumber'],true);
		$df = json_decode($col['domicilioFiscal'],true);
		$name = (!empty($col['name']))? $col['name'] : $col['contacto'];
		echo "<tr>";
			
			echo "<td>" . $col['id'] . "</td>";
			echo "<td>" .  utf8_decode(utf8_encode($name)) . "</td>";
			echo "<td>". $col['email'] ."</td>";
			echo "<td>". $tt['particular'] . "</td>";
			echo "<td>". $tt['mobil'] . "</td>";
			echo "<td>". $df['calle'] ."". $df['noExterior'] . "</td>";
			echo "<td>". $df['colonia'] . "</td>";
			echo "<td>". $df['CodigoPostal'] . "</td>";
			echo "<td>". $col['type'] . "</td>";
			echo "<td>". $col['rfc'] ."</td>";
		
		echo "</tr>";
	}
	
	echo "</table>"; // Fin de la tabla

	// cerrar conexión de base de datos
	mysqli_close( $conexion );
?>
