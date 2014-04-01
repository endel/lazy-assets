<?php
require_once 'utils.php';

spl_autoload_register(function($class) {
	include 'compilers/' . $class . '.php';
});

class Responder {
	protected $params;

	public function __construct($params = array()) {
		$this->params = $params;
	}

	public function evaluate($request_uri) {
		// ensure valid directory reference to all requests
		if (strpos($request_uri, $_SERVER['DOCUMENT_ROOT']) !== 0) {
			$request_uri = $_SERVER['DOCUMENT_ROOT'] . '/' . $request_uri;
		}

		$filepath = parse_url($request_uri, PHP_URL_PATH);
		$extension = pathinfo($filepath, PATHINFO_EXTENSION);
		parse_str(parse_url($request_uri, PHP_URL_QUERY), $options);

		$options = array_merge($this->params, $options);
		if (isset($options['compile'])) {
			$extension = $options['compile'];
		}

		return call_user_func(array($this, $extension), $filepath);
	}

	public function html($filepath) {
		$parser = new Html($filepath);
		return $parser->parse();
	}

	public function __call($name, $args) {
		$files = glob($args[0]);

		$klass = 'BaseCompiler';
		if (class_exists(ucfirst($name))) {
			$klass = ucfirst($name);
		}
		return new $klass($files);
	}

}
