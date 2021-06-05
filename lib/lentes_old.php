<html>
<head>
	<title>Lentes</title>
</head>
<body>
	<section>
		<table>
		<thead>
			<tr>
				<th>attribute_id</th>
				<th>name</th>
			</tr>
		</thead>
		<tbody>
		<?php for ($i = -6; $i <= 6; $i+=0.25) {
			for ($j = -2; $j <= 0; $j+=0.25) { ?>
			<tr>
				<td>Graduacion</td>
				<td><?php echo "$i $j"; ?></td>
			</tr>
		<?php } } ?>
		</tbody>
		</table>
	</section>
</body>
</html>
