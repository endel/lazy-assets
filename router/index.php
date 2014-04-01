<?php
// compiler
if ($argv) {
	require 'compiler.php';
	list(,$input,$output) = $argv;

	if (!$input) {
		die("Usage: php compiler.php {input_dir} {output_dir}" . PHP_EOL);
	}

	if (!$output) {
		$output = $input . "/../public";
	}

	// recursively make output directory
	if (!is_dir($output)) {
		mkdir($output, 0777, true);
	}

	$input = realpath($input);
	$output = realpath($output);

	$_SERVER['DOCUMENT_ROOT'] = $input;
	$compiler = new Compiler($input, $output);

	$htmls = Utils::glob($input.'/*.html');
	$bower_root = Html::getBowerRoot();
	foreach($htmls as $html) {
		if (strpos($html, $bower_root) === false) {
			$html = realpath($html);
			$html_dir = str_replace($input, $output, dirname($html));
			if (!is_dir($html_dir)) {
				mkdir($html_dir, 0777, true);
			}
			echo "Compiling: {$html}..." . PHP_EOL;
			$compiler->compile($html);
		}
	}

} else {
	require 'responder.php';
	$responder = new Responder($_GET);

	if (!isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
		$resource = substr($_SERVER['REQUEST_URI'], 1) ?: $_SERVER['SCRIPT_FILENAME'];

	} else {
		// Handle proxied request.
		preg_match('/([^\.]+)/', $_SERVER['HTTP_X_FORWARDED_HOST'], $host);
		chdir('../../' . $host[1]);
		$_SERVER['DOCUMENT_ROOT'] = getcwd() . '/app';
		$resource = substr($_SERVER['PATH_INFO'], 1);
	}

	$extension = pathinfo(parse_url($resource, PHP_URL_PATH), PATHINFO_EXTENSION);
	header('Content-type: ' . Utils::getMimeType($extension));

	echo $responder->evaluate($resource)->toString();
}
