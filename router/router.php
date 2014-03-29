<?php
require 'responder.php';
$responder = new Responder($_GET);
echo $responder->evaluate(isset($argv[1]) ? $argv[1] : $_SERVER['SCRIPT_FILENAME']);
