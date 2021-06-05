<?php
	header("Content-Type: text/html; charset=utf-8");
	$usuario = "root";
	$password = "Optica.madero";
	$servidor = "localhost";
	$basededatos = "omadero";
	
	// creación de la conexión a la base de datos con mysql_connect()
	$conexion = mysqli_connect( $servidor, $usuario, $password, $basededatos ) or die ("No se ha podido conectar al servidor mysql");
	
	// establecer y realizar consulta. guardamos en variable.
	$consulta = "SELECT p.code,p.name,p.brand,s.price as price FROM store_items AS p LEFT JOIN store_lot AS s ON s.ids=p.id ".
	"WHERE p.brand='' AND p.name!='' LIMIT 0,1000";
	$resultado = mysqli_query( $conexion, $consulta ) or die ( "Algo ha ido mal en la consulta a la base de datos");
	
		
	// Motrar el resultado de los registro de la base de datos
	// Encabezado de la tabla
	echo "<table border='2'>";
	echo "<tr>";
		echo "<th>referencia interna</th>";
		echo "<th>nombre</th>";
		echo "<th>Precio de venta</th>";
		echo "<th>Tipo de producto</th>";
	echo "</tr>";
	
	// Bucle while que recorre cada registro y muestra cada campo en la tabla.
	while ($col = mysqli_fetch_array( $resultado ))
	{
		echo "<tr>";
			echo "<td>". $col['code'] ."</td>";
			echo "<td>". $col['name'] ."</td>";
			echo "<td>". $col['price'] . "</td>";
			echo "<td>Almacenable</td>";
		
		echo "</tr>";
	}
	
	echo "</table>"; // Fin de la tabla

	// cerrar conexión de base de datos
	mysqli_close( $conexion );
?>
