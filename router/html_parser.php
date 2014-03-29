<?php

class HTMLParser {

	protected $document;
	protected $javascripts;
	protected $stylesheets;

	protected $javascript_extensions = array('coffee', 'js', 'jsx');
	protected $stylesheet_extensions = array('less', 'css', 'scss', 'sass', 'styl');

	public function __construct($filepath) {
		$this->document = file_get_contents($filepath);
		$this->stylesheets = array();
		$this->javascripts = array();
	}

	public function parse() {
		$assets_html = "";
		preg_match_all('/<asset ([^>]+)\/>/', $this->document, $assets);

		foreach($assets[1] as $asset) {
			preg_match_all('/([a-z_-]+)=[\'"]([^\'"]+)[\'"]/', $asset, $attributes);
			$this->evaluate_item(array_combine($attributes[1], $attributes[2]));
		}

		foreach($this->stylesheets as $stylesheet) {
			$assets_html .= '<link href="'.$stylesheet.'" rel="stylesheet" media="all" type="text/css" />' . "\n";
		}
		foreach($this->javascripts as $javascript) {
			$assets_html .= '<script type="text/javascript" src="'.$javascript.'"></script>' . "\n";
		}

		return preg_replace('/<assets(.*)<\/assets>/si', $assets_html, $this->document);
	}


	protected function evaluate_item($data) {
		$ext = pathinfo($data['href'], PATHINFO_EXTENSION);

		if (isset($data['compile'])) {
			$data['href'] .= '?compile=' . $data['compile'];
		}

		// prevent cache
		if (!isset($data['source'])) {
			$data['href'] .= (strpos($data['href'], '?') !== false) ? '&' : '?';
			$data['href'] .= uniqid();
		}

		if (in_array($ext, $this->javascript_extensions)) {
			array_push($this->javascripts, $data['href']);

		} else if (in_array($ext, $this->stylesheet_extensions)) {
			array_push($this->stylesheets, $data['href']);

		} else if (isset($data['source']) && $data['source'] == 'bower') {
			$this->evaluate_bower($data);
		}

	}

	protected function evaluate_bower($data) {
		$bower_root = json_decode(file_get_contents('.bowerrc'), true)['directory'];
		$package_name = $data['href'];
		$package_dir = $bower_root . '/' . $package_name;

		if (!is_dir($package_dir)) {
			file_put_contents('php://stdout', "Installing '{$package_name}' package from bower." . PHP_EOL);

			exec('bower install -S '. $package_name, $output, $return_val);
			if ($return_val != 0) {
				die(join("<br />", $output));
			}
		}

		$files = null;

		// forced 'main' files?
		if (isset($data['main'])) {
			$files = preg_split('/,/', $data['main']);

		} else {

			// try to parse 'main' from bower.json
			$bower_file = $package_dir . '/bower.json';
			$bower = (file_exists($bower_file)) ? json_decode(file_get_contents($bower_file), true) : null;

			if ($bower && isset($bower['main'])) {
				$files = $bower['main'];
			} else {

				// try to detect main file with some patterns
				$patterns = array(
					$package_dir . '/' . $package_name . '.js',
					$package_dir . '/jquery.' . $package_name . '.js',
					$package_dir . '/{dist,build}/' . $package_name . '.js',
					$package_dir . '/{dist,build}/jquery.' . $package_name . '.js',
				);

				foreach($patterns as $pattern) {
					$files = glob($pattern, GLOB_BRACE);
					file_put_contents('php://stdout', "'{$pattern}' => " . json_encode($files) . PHP_EOL);
					if ($files && !empty($files)) {
						foreach($files as &$file) {
							// normalize for further reference
							$file = str_replace($package_dir . '/', '', $file);
						}
						break;
					}
				}

			}

		}

		if (!$files) {
			die("'{$package_name}' should define 'main' file(s).");
		}

		if (is_string($files)) {
			$files = array($files);
		}

		$root_base = basename($_SERVER['DOCUMENT_ROOT']);
		$assets_root = preg_replace("/^{$root_base}\//", "", $bower_root);
		foreach($files as $file) {
			$this->evaluate_item(array(
				'href' => $assets_root . '/' . $package_name . '/' . str_replace("./", "", $file)
			));
		}

	}

}
