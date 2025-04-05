<?php
$input = $_GET["intent"];
$ff = $_GET["font"];
$fp = "/fonts/" . $ff . ".ttf";
$style = $_GET["style"];
header ("Content-type: image/png");
$handle = ImageCreate (400, 350) or die ("Cannot Create image");
$bg_color = ImageColorAllocate ($handle, 255, 255, 255);
$txt_color = ImageColorAllocate ($handle, 0, 0, 0);
for ($i=0; $i< strlen($input); $i++) {
        $a = substr($input, $i, 1);
	if ($style == "m") {
          $r = 14.4 * (ord(strtoupper($n)) - 65);
          $n = $r + 17;
	} elseif ($style == "r") {
	  $n = mt_rand();
	} elseif ($style == "o") {
	  $n = ord(strtoupper($n));
	} elseif ($style == "r23") {
	  $n = $i * 23;
	} elseif ($style == "a45") {
	  $n = $i * 45;
	} elseif ($style == "a90") {
	  $n = $i * 90;
	} elseif ($style == "s") {
	  $n = $n;
	}
        ImageTTFText ($handle, 100, $n, 250, 200, $txt_color, $fp, "$a");
}
ImagePng ($handle);
?>

