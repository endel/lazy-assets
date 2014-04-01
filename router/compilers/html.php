<?php

class Html {
	protected $filename;
	protected $document;

	public $assets;
	public $javascripts;
	public $stylesheets;
	public $fonts;

	protected $javascript_extensions = array('coffee', 'js', 'jsx');
	protected $stylesheet_extensions = array('less', 'css', 'scss', 'sass', 'styl');
	protected $font_extensions = array('svg', 'eot', 'woff', 'ttf');

	public function __construct($filename) {
		$this->filename = $filename;
		$this->document = file_get_contents($filename);
		$this->stylesheets = array();
		$this->javascripts = array();
		$this->fonts = array();
	}

	public function parse() {
		preg_match_all('/<asset ([^>]+)\/>/', $this->document, $asset_tags);
		$this->assets = array();

		foreach($asset_tags[1] as $asset_tag) {
			preg_match_all('/([a-z_-]+)=[\'"]([^\'"]+)[\'"]/', $asset_tag, $attributes);
			$asset = array_combine($attributes[1], $attributes[2]);
			array_push($this->assets, $asset);
			$this->evaluate_item($asset);
		}

		return $this;
	}

	public function toString() {
		$assets_html = "";
		foreach($this->stylesheets as $stylesheet) {
			$assets_html .= '<link href="'.$stylesheet.'" rel="stylesheet" media="all" type="text/css" />' . "\n";
		}
		foreach($this->javascripts as $javascript) {
			$assets_html .= '<script type="text/javascript" src="'.$javascript.'"></script>' . "\n";
		}
		return preg_replace('/<assets(.*)<\/assets>/si', $assets_html, $this->document);
	}

	public function optimize() {
		// TODO: compress html
		return $this->toString();
	}

	protected function evaluate_item($asset) {
		$ext = pathinfo($asset['href'], PATHINFO_EXTENSION);

		if (isset($asset['compile'])) {
			$asset['href'] .= '?compile=' . $asset['compile'];
		}

		// prevent cache
		if (!isset($asset['source'])) {
// 			// try to get packages that doesn't exist from 'bower'
// 			$package_exists = glob($asset['href']);
// 			if (empty($package_exists)) {
// 				$asset['source'] = 'bower';
//
// 			} else {
				$asset['href'] .= (strpos($asset['href'], '?') !== false) ? '&' : '?';
				$asset['href'] .= uniqid();
// 			}
		}

		if (in_array($ext, $this->javascript_extensions)) {
			array_push($this->javascripts, $asset['href']);

		} else if (in_array($ext, $this->stylesheet_extensions)) {
			array_push($this->stylesheets, $asset['href']);

		} else if (in_array($ext, $this->font_extensions)) {
			array_push($this->fonts, $asset['href']);

		} else if (isset($asset['source']) && $asset['source'] == 'bower') {
			$this->evaluate_bower($asset);
		}

	}

	protected function evaluate_bower($asset) {
		$bower_root = static::getBowerRoot();
		$package_name = $asset['href'];
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
		if (isset($asset['main'])) {
			$files = preg_split('/,/', $asset['main']);

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

	public static function getBowerRoot() {
		$root = "bower_components";
		if (file_exists('.bowerrc')) {
			$bowerrc = json_decode(file_get_contents('.bowerrc'), true);
			if (isset($bowerrc['directory'])) {
				$root = $bowerrc['directory'];
			}
		}
		return $root;
	}

}
