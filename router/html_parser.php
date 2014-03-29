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

		if (in_array($ext, $this->javascript_extensions)) {
			array_push($this->javascripts, $data['href']);

		} else if (in_array($ext, $this->stylesheet_extensions)) {
			array_push($this->stylesheets, $data['href']);

		} else if (isset($data['source']) && $data['source'] == 'bower') {
			$bower_root = json_decode(file_get_contents('.bowerrc'), true)['directory'];
			$bower_file = $bower_root . $data['href'] . '/bower.json';

			if (!is_dir($bower_root . $data['href'])) {
				file_put_contents('php://stdout', "Installing '{$data['href']}' package from bower.");

				exec('bower install -S '. $data['href'], $output, $return_val);
				if ($return_val != 0) {
					die(join("\n", $output));
				}
			}

			$bower = (file_exists($bower_file)) ? json_decode(file_get_contents($bower_file), true) : array();
			$files = null;

			if (isset($bower['main'])) {
				$files = $bower['main'];
			} else if (isset($data['main'])) {
				$files = preg_split('/,/', $data['main']);
			}

			if (!$files) {
				die("'{$data['href']}' should define 'main' file(s).");
			}

			if (is_string($files)) {
				$files = array($files);
			}

			foreach($files as $file) {
				$this->evaluate_item(array(
					'href' => basename($bower_root) . '/' . $data['href'] . '/' . str_replace("./", "", $file)
				));
			}
		}

	}

}
