<?php

class Styl extends Css {
	protected $compiler = 'stylus --include node_modules/grunt-contrib-stylus/node_modules/nib/lib/ --include-css -r -f -p {input}';
	protected $optimizer = 'stylus --include node_modules/grunt-contrib-stylus/node_modules/nib/lib/ --include-css -r -p {input}';

}
