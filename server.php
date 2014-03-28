<?php

$extension = pathinfo($_SERVER['SCRIPT_FILENAME'], PATHINFO_EXTENSION);
$document = file_get_contents($_SERVER['SCRIPT_FILENAME']);
$mime_types = array(
	'txt' => 'text/plain',
	'htm' => 'text/html',
	'html' => 'text/html',
	'php' => 'text/html',
	'css' => 'text/css',
	'js' => 'application/javascript',
	'json' => 'application/json',
	'xml' => 'application/xml',
	'swf' => 'application/x-shockwave-flash',
	'flv' => 'video/x-flv',

	// images
	'png' => 'image/png',
	'jpe' => 'image/jpeg',
	'jpeg' => 'image/jpeg',
	'jpg' => 'image/jpeg',
	'gif' => 'image/gif',
	'bmp' => 'image/bmp',
	'ico' => 'image/vnd.microsoft.icon',
	'tiff' => 'image/tiff',
	'tif' => 'image/tiff',
	'svg' => 'image/svg+xml',
	'svgz' => 'image/svg+xml',

	// archives
	'zip' => 'application/zip',
	'rar' => 'application/x-rar-compressed',
	'exe' => 'application/x-msdownload',
	'msi' => 'application/x-msdownload',
	'cab' => 'application/vnd.ms-cab-compressed',

	// audio/video
	'mp3' => 'audio/mpeg',
	'qt' => 'video/quicktime',
	'mov' => 'video/quicktime',

	// adobe
	'pdf' => 'application/pdf',
	'psd' => 'image/vnd.adobe.photoshop',
	'ai' => 'application/postscript',
	'eps' => 'application/postscript',
	'ps' => 'application/postscript',

	// ms office
	'doc' => 'application/msword',
	'rtf' => 'application/rtf',
	'xls' => 'application/vnd.ms-excel',
	'ppt' => 'application/vnd.ms-powerpoint',

	// open office
	'odt' => 'application/vnd.oasis.opendocument.text',
	'ods' => 'application/vnd.oasis.opendocument.spreadsheet',
);

header('Content-type: ' . $mime_types[$extension]);

function public_dir($segments='') {
	return 'app/' . $segments;
}

//
if ($extension === "html") {
	$stylesheets = array();
	$javascripts = array();

	preg_match_all('/<asset ([^>]+)\/>/', $document, $assets);
	foreach($assets[1] as $asset) {
		preg_match_all('/([a-z_-]+)=[\'"]([^\'"]+)[\'"]/', $asset, $attrs);
		$attributes = array_combine($attrs[1], $attrs[2]);
		file_put_contents('php://stdout', json_encode($attributes) . PHP_EOL);

		if (isset($attributes['source']) && $attributes['source'] == 'bower') {
			$bower_root = json_decode(file_get_contents('.bowerrc'), true)['directory'];
			$bower_file = $bower_root . $attributes['href'] . '/bower.json';

			if (!file_exists($bower_file)) {
				file_put_contents('php://stdout', "Installing '{$attributes['href']}' package from bower.");
				exec('bower install -S '. $attributes['href']);
			}

			$bower = json_decode(file_get_contents($bower_file), true);
			$files = null;

			if (isset($bower['main'])) {
				$files = $bower['main'];
			} else if (isset($attributes['main'])) {
				$files = preg_split('/,/', $attributes['main']);
			}

			if (!$files) {
				die("'{$attributes['href']}' should define 'main' file(s).");
			}

			if (is_string($files)) {
				$files = array($files);
			}

			foreach($files as $file) {
				$file = basename($bower_root) . '/' . $attributes['href'] . '/' . str_replace("./", "", $file);
				$extension = pathinfo($file, PATHINFO_EXTENSION);
				if ($extension == "js") {
					array_push($javascripts, $file);
				} else if ($extension == "css") {
					array_push($stylesheets, $file);
				}
			}

		}

	}

	$assets_html = "";
	foreach($stylesheets as $stylesheet) {
		$assets_html .= '<link href="'.$stylesheet.'" rel="stylesheet" media="all" type="text/css" />' . "\n";
	}
	foreach($javascripts as $javascript) {
		$assets_html .= '<script type="text/javascript" src="'.$javascript.'"></script>' . "\n";
	}

	$document = preg_replace('/<assets(.*)<\/assets>/si', $assets_html, $document);
}

echo $document;
