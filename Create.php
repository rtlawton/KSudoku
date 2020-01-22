<!DOCTYPE html>
<html lang = "en-US">
<meta http-equiv="content-type" content="text/html;charset=utf-8" />
<head>
<script type="text/javascript" src="jquery-2.1.3.js"></script>
<script type="text/javascript" src="Jscript2.js"></script>
<title></title>
<link rel="stylesheet" type="text/css" href="StyleSheet2.css"/>
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
</head>
<body onload="startup()" ondragstart="return false;" ondrop="return false;">
    <form><div id='floatcentre'>
        
        <div class='topbar' oncontextmenu="return false">
            <img id='logo' src='favicon.png'>
            <div id='createtot' class='topdata'>Total:<span id='createtotno'>0</span></div>
            <div id='symmetry' class='topdata'>Symmetry: <select id="symm">
  <option value="none">None</option>
  <option value="hor">σh</option>
  <option value="vert">σv</option>
  <option value="diag">σd</option>
  <option value="spin">C2</option>
</select></div>
             <div id='cdiff' class='topdata'>Difficulty: <select id="diff">
  <option value="0" selected="selected">Easy</option>
  <option value="1">Moderate</option>
  <option value="2">Hard</option>
  <option value="3">Extreme</option>
  <option value="4">Outrageous</option>
  <option value="5">Mind bending</option>
</select></div>
        <div id='cgameid' class='topdata'><div class='gm'>Game: </div> 
        <div contenteditable id='gameid' class='gm' onblur='unique()' onkeypress='return gmnoenter(event)'></div></div></div>
        <div id='mainboxcreate'>
<?php
    for ($row=1;$row<10;$row++){
        for ($col=1;$col<10;$col++){
            echo "<div id='c" . $row . $col . "'; style='top:" . (string)(65*($row-1)) . "px;left:" . (string)(65*($col-1)) . "px'; data-col='" . (string)$col . "'; data-row='" . (string)$row . "'; data-block='0'; class='ecell'; " . "onmouseover='doselect(this)'; onmousedown='startselect(this)'; onmouseup='endselect()'></div>";
        }
    }
    for ($row=0;$row<10;$row++){
        for ($col=0;$col<10;$col++) {
            $top = -8+65*$row;
            $left = -8+65*$col;
            echo "<img src='graphics/J0000.png' class='corner' id='J" . $row . $col . "' width=11 height=11 style='position:absolute; top:" . (string)$top . "px;left:" . (string)$left . "px'>";
        }
    }
    for ($row=1;$row<10;$row++){
        for ($col=1;$col<10;$col++) {
            $top = 60 + 65 * ($row - 1);
            $left = 65 * ($col - 1);
            if ($row != 9) {
                echo "<div id='H" . $row . $col . "' class='hbar' style='position:absolute; top:" . (string)$top . "px;left:" . (string)$left . "px'></div>";
            }           
            $top = $top - 60;
            $left = $left + 60;
            if ($col != 9) {
                echo "<div id='V" . $row . $col . "' class='vbar' style='position:absolute; top:" . (string)$top . "px;left:" . (string)$left . "px'></div>";
            }
        }
    }
?>      
        <div id='screen'></div>
        <div class='totin'>Block total:</div>
        </div>
         <div id='ksd'> 
    <object id='ksdo' type="text/html">
    </object>
 </div>
        <div class = 'popup'; id='popupbox'><br>
        <span id='msgtxt'>TEXT</span><br><br>
        <img id='msgimg'; src='graphics/notice.png'><br><br>
        <button type='button'; onclick='closeBox()'>OK</button>
    </div> 
        <div id='bottombar'>
<div id='buttonbar'>
    <button type='button' onclick='creset()'>Reset</button>
    <button type='button' id='savestay' onclick='saveGame("stay")'>Save and reset</button>
    <button type='button' id='saveplay' onclick='saveGame("play")'>Save and play now</button></div>
</div>
        </div>

    </form>
</body>
</html>