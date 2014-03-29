<?php
require 'utils.php';
require 'html_parser.php';

class Responder {
	protected $params;

	protected $compilers = array(
		'browserify' => 'browserify -t brfs',
		'coffee' => 'coffee -pc',
		'less' => 'lessc',
		// TODO expose custom commandline arguments to the user.
		'styl' => 'stylus --include node_modules/grunt-contrib-stylus/node_modules/nib/lib/ --include-css -r -f -p'
	);

	public function __construct($params) {
		$this->params = $params;
	}

	public function evaluate($request_uri) {
		// ensure valid directory reference to all requests
		if (strpos($request_uri, $_SERVER['DOCUMENT_ROOT']) !== 0) {
			$request_uri = $_SERVER['DOCUMENT_ROOT'] . '/' . $request_uri;
		}

		$filepath = parse_url($request_uri, PHP_URL_PATH);
		$extension = pathinfo($filepath, PATHINFO_EXTENSION);
		header('Content-type: ' . Utils::getMimeType($extension));

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
		$files = glob($args[0]);

		if (isset($this->compilers[$name])) {
			exec($this->compilers[$name] . ' ' . join(' ', $files), $output, $return_val);
			return join("\n", $output);
		} else {
			$contents = "";
			foreach($files as $file) {
				$contents .= file_get_contents($file);
			}
			return $contents;
		}
	}

}
