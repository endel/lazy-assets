<?php

class BaseCompiler {
	protected $files;

	public function __construct($files) {
		if (is_string($files)) {
			$files = array($files);
		}
		$this->files = $files;
	}

	public function toString() {
		if (isset($this->compiler)) {
			$command = str_replace('{input}', join(' ', $this->files), $this->compiler);
			exec($command, $output, $return_val);
			return join("\n", $output);

		} else {
			$output = "";
			foreach ($this->files as $file) {
				$output .= file_get_contents($file);
			}
			return $output;
		}

	}

	public function optimize() {
		if (isset($this->optimizer)) {
			$command = str_replace('{input}', join(' ', $this->files), $this->optimizer);
			exec($command, $output, $return_val);
			return join("\n", $output);

		} else {
			$this->toString();
		}
	}

}
