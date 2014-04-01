<?php

class Css extends BaseCompiler {
	protected $optimizer = 'minify --no-comments -o {output} {input}';

	public function optimize() {
		// TODO: use a commandline tool that outputs to STDOUT.
		// `minify` doens't support that.
		$tmp_output = tempnam("/tmp", "lazy-css");
		$command = str_replace('{output}', $tmp_output, $this->optimizer);
		$command = str_replace('{input}', join(' ', $this->files), $command);
		exec($command, $output, $return_val);
		return file_get_contents($tmp_output);
	}

}
