<?php

class Less extends Css {
	protected $optimizer = 'lessc --clean-css {input}';
	protected $compiler = 'lessc {input}';

}
