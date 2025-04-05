<html>
<head>
<META HTTP-EQUIV=\"expires\" CONTENT=\"0\">
</head>
<body>

<?php

  $version = "1.6"; 

  $headline = "<p><font size=+3><b>Sigil Creator v" . $version . "</b></font> <i>by <a href='http://17hex.net/' target='Main'>17hex</a></i></p>";
  $explain = "<p>If you have no idea what a Sigil is, you can get a basic description on <a href='http://en.wikipedia.org/wiki/Sigil_%28magic%29'>Wikipedia</a></p>";

  if (!isset($_POST['intent'])) {
?>
   <?php echo $headline;
    echo $explain; ?>

    <form method="post" action=<?php echo $PHP_SELF;?>>
    <table bgcolor="#80B0FF">
    <tr>
    <td align="right"><b>Statement of Intent:</b></td>
    <td colspan="2"><i>It is my Will to </i><input type="text" size="40" maxlength="40" name="intent"></td>
    <tr>
    <td align="right"><b>Font Face:</b></td>
    <td><select name="font">
      <option value="sgread">Ancient Greek</option>
      <option selected value="AnnabelScript">AnnabelScript</option>
      <option value="Benegraphic">Benegraphic</option>
      <option value="Drummon">Drummon</option>
      <option value="RUNE">Elder Futhark</option>
      <option value="firstv2l">FirstOrder</option>
      <option value="lowdown">Lowdown</option>
      <option value="BLN">Ogham</option>
      <option value="oneway">Oneway</option>
      <option value="telephas">Telephasic</option>
      <option value="UNIVOX">Univox</option>
    </select></td>
    <td align="left"><b>Letter Placement:</b><select name="line">
      <option value="l">Line</option>  
      <option selected value="s">Stacked</option>  
    </select></td>
    </tr>
    <tr>
    <td align="right"><b>Rotate Style:</b></td>
    <td><select name="style">
      <option value="m">Mathematical</option>
      <option value="o">Ordinal</option>
      <option value="r">Random</option>
      <option value="s">Straight</option>
      <option value="r23">23 Degrees</option>
      <option value="a45">45 Degrees</option>
      <option value="a90">90 Degrees</option>
    </select>
    </td>
    <td></td>
    </tr>
    <tr>
    <td></td>
    <td>
    <input type="submit" value="Submit">
    <input type="reset" value="Destroy" onClick="window.location='http://17hex.net/sigil'">
    </td>
    </tr>
    <tr>
    <td align="right"><b>Sigilized Letter Set:</b></td>
    <td bgcolor="#AAAAAA"></td>
    </tr>
    </table>
    </form>
<?php
  } else {
	$input = $_POST["intent"];
	$string = strtoupper($input);
	$uniq = count_chars($string, 3);
	$vowels = array("a", "e", "i", "o", "u", "A", "E", "I", "O", "U");
	$letters = str_replace($vowels, "", $uniq);
        $ff = $_POST["font"];
	$style = $_POST["style"];
	$line = $_POST["line"];
        $action = "sigil.php?intent=" . $letters . "&font=" . $ff . "&style=" . $style;
#        echo "Action will be: " . $action . "\n";
?>
    <?php echo $headline;
    echo $explain; ?>
    <form method="post" action=<?php echo $PHP_SELF;?>>
    <table bgcolor="#80B0FF">
    <tr>
    <td><b>Statement of Intent:</b></td>
    <td colspan="2" align="left"><i>It is my Will to </i><input type="text" size="40" maxlength="40" name="intent" value="<?php echo $input; ?>"></td>
    <tr>
    <td align="right"><b>Font Face:</b></td>
    <td><select name="font">
      <option <?php if ($ff=="sgread") {echo "selected ";} ?>value="sgread">Ancient Greek</option>
      <option <?php if ($ff=="AnnabelScript") {echo "selected ";} ?>value="AnnabelScript">AnnabelScript</option>
      <option <?php if ($ff=="Benegraphic") {echo "selected ";} ?>value="Benegraphic">Benegraphic</option>
      <option <?php if ($ff=="Drummon") {echo "selected ";} ?>value="Drummon">Drummon</option>
      <option <?php if ($ff=="RUNE") {echo "selected ";} ?>value="RUNE">Elder Futhark</option>
      <option <?php if ($ff=="firstv2l") {echo "selected ";} ?>value="firstv2l">FirstOrder</option>
      <option <?php if ($ff=="lowdown") {echo "selected ";} ?> value="lowdown">Lowdown</option>
      <option <?php if ($ff=="BLN") {echo "selected ";} ?>value="BLN">Ogham</option>
      <option <?php if ($ff=="oneway") {echo "selected ";} ?>value="oneway">Oneway</option>
      <option <?php if ($ff=="telephas") {echo "selected ";} ?> value="telephas">Telephasic</option>
      <option <?php if ($ff=="UNIVOX") {echo "selected ";} ?>value="UNIVOX">Univox</option>
    </select></td>
    <td align="left"><b>Letter Placement:</b><select name="line">
      <option  <?php if ($line=="l") {echo "selected ";} ?>value="l">Line</option>
      <option  <?php if ($line=="s") {echo "selected ";} ?>value="s">Stacked</option>
    </select></td>
    </tr>
    <tr>
    <td align="right"><b>Rotate Style:</b></td>
    <td><select name="style">
      <option <?php if ($style=="m") {echo "selected ";} ?>value="m">Mathematical</option>
      <option <?php if ($style=="o") {echo "selected ";} ?>value="o">Ordinal</option>
      <option <?php if ($style=="r") {echo "selected ";} ?>value="r">Random</option>
      <option <?php if ($style=="s") {echo "selected ";} ?>value="s">Straight</option>
      <option <?php if ($style=="r23") {echo "selected ";} ?>value="r23">23 Degrees</option>
      <option <?php if ($style=="a45") {echo "selected ";} ?> value="a45">45 Degrees</option>
      <option <?php if ($style=="a90") {echo "selected ";} ?> value="a90">90 Degrees</option>
    </select>
    </td>
    </tr>
    <tr>
    <td></td>
    <td>
    <input type="submit" value="Submit">
    <input type="reset" value="Destroy" onClick="window.location='http://17hex.net/sigil'">
    </td>
    </tr>
    <tr>
    <td align="right"><b>Sigilized Letter Set:</b></td>
    <td bgcolor="#AAAAAA"><?php echo $letters; ?></td>
    </tr>
    </table>
    </form>

<img src="<?php echo $action; ?>" />

<?php } ?>

</body>
</html>
