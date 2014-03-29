<?php
require 'responder.php';
$responder = new Responder($_GET);
$resource = isset($argv[1]) ? $argv[1] : substr($_SERVER['REQUEST_URI'], 1) ?: $_SERVER['SCRIPT_FILENAME'];
echo $responder->evaluate($resource);
