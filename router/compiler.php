<?php
require_once 'responder.php';
require_once 'compilers/js.php';
require_once 'compilers/css.php';

class Compiler {

	protected $input;
	protected $output;

	public function __construct($input, $output) {
		$this->input = $input;
		$this->output = $output;
	}

	public function compile($filename) {
		$id = basename($filename, '.html');
		$output = dirname(str_replace(realpath($this->input), $this->output, $filename)) . '/';

		$responder = new Responder();
		$html = $responder->evaluate($filename);

		// concat javascripts
		if (!empty($html->javascripts)) {
			$javascripts = "";
			foreach($html->javascripts as $javascript) {
				echo "Evaluating... {$javascript}" . PHP_EOL;
				$javascripts .= ';' . $responder->evaluate($javascript)->toString();
			}

			// concat & compress
			$concat_javascript = $output . $id . '.js';
			file_put_contents($concat_javascript, $javascripts);
			echo "Optimizing: {$concat_javascript}" . PHP_EOL;
			$js = new Js($concat_javascript);
			file_put_contents($concat_javascript, $js->optimize());

			// re-set javascripts to the compiled one.
			$html->javascripts = array(str_replace($output, "", $concat_javascript));
		}

		// concat stylesheets
		if (!empty($html->stylesheets)) {
			$stylesheets = "";
			foreach($html->stylesheets as $stylesheet) {
				echo "Evaluating... {$stylesheet}" . PHP_EOL;
				$stylesheets .= $responder->evaluate($stylesheet)->toString();
			}

			// concat & compress
			$concat_stylesheet = $output . $id . '.css';
			file_put_contents($concat_stylesheet, $stylesheets);
			echo "Optimizing: {$concat_stylesheet}" . PHP_EOL;
			$css = new Css($concat_stylesheet);
			file_put_contents($concat_stylesheet, $css->optimize());

			// re-set javascripts to the compiled one.
			$html->stylesheets = array(str_replace($output, "", $concat_stylesheet));
		}

		file_put_contents($output . basename($filename), $html->toString());
	}

}

