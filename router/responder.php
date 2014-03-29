<?php
require 'mime_type.php';
require 'html_parser.php';

class Responder {
	protected $params;

	protected $compilers = array(
		'browserify' => 'browserify -t brfs',
		'coffee' => 'coffee -pc',
		'less' => 'lessc'
	);

	public function __construct($params) {
		$this->params = $params;
	}

	public function evaluate($filepath) {
		$extension = pathinfo($filepath, PATHINFO_EXTENSION);
		header('Content-type: ' . MimeType::getByExtension($extension));

		if (isset($this->params['compile'])) {
			$extension = $this->params['compile'];
		}

		return call_user_func(array($this, $extension), $filepath);
	}

	public function html($filepath) {
		$parser = new HTMLParser($filepath);
		return $parser->parse();
	}

	public function __call($name, $args) {
		$filepath = $args[0];
		if (isset($this->compilers[$name])) {
			exec($this->compilers[$name] . ' ' . $filepath, $output, $return_val);
			return join("\n", $output);
		} else {
			return file_get_contents($filepath);
		}
	}

}
