<?php
require_once('config.php');
require_once('utilities.php');
if (isset($_REQUEST['q'])){
    $gm = $_GET['q'];
    if (isset($_COOKIE["game"])) {
        if ($_COOKIE['game'] == $gm) {
            setcookie('mode', 'CONTINUE', time() + (86400 * 365), "/");
        } else {
            setcookie('mode', 'RESET', time() + (86400 * 365), "/");
            setcookie('game', $gm, time() + (86400 * 365), "/");
        }
    } else {
        setcookie('mode', 'RESET', time() + (86400 * 365), "/");
        setcookie('game', $gm, time() + (86400 * 365), "/");
    }
} elseif (isset($_COOKIE["game"])) { 
    $gm = $_COOKIE["game"];
    setcookie('mode', 'CONTINUE', time() + (86400 * 365), "/");
} else {
    $gm = '0';
    setcookie('game', '0', time() + (86400 * 365), "/");
    setcookie('mode', 'RESET', time() + (86400 * 365), "/");
}
try {
    $db = new PDO(PDO_CONNECT,USER, PSWD, $PDO_OPTIONS);
    $stmt = $db->prepare('SELECT Games.Frame, Games.Difficulty FROM Games WHERE Games.Code=?;');
    $stmt->execute([$gm]);
    if ($stmt->rowCount() == 0) {
        $stmt->execute(['0']);
        setcookie('game', '0', time() + (86400 * 365), "/");
        setcookie('mode', 'RESET', time() + (86400 * 365), "/");
    }
    $dbRow = $stmt->fetch(PDO::FETCH_NUM);
    $stmt = $db->query("SELECT Games.Code, Games.Difficulty, Games.Lastdone FROM Games ORDER BY Games.Code;");
    $gamesList = $stmt->fetchAll(PDO::FETCH_NUM);
}
catch(PDOException $ex) {
    echo $ex->getMessage();
};
$db = null;
    $pF = parseFrame($dbRow[0]);
    $grid = $pF[0];
    $totals = $pF[1];
    $anchors = $pF[2];
//<script type="text/javascript" src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
?>
<!DOCTYPE html>
<html lang = "en-US">
<head>
<script type="text/javascript" src="jquery-2.1.3.js"></script>
<script type="text/javascript" src="Jscript.js"></script>
<title></title>
<link rel="stylesheet" type="text/css" href="StyleSheet.css"/>
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
</head>
<body onload="startup()">
    <form><div id='floatcentre'>
        <div class='topbar' oncontextmenu="return false">
            <img id='logo' src='favicon.png'>
            <div id='game' class='topdata'></div>
            <div id='stage' class='topdata'></div>
<?php
         echo "<div id='difficulty' class='topdata'>Difficulty: " . diff(intval($dbRow[1])) . "</div>";
?>
        <div id='createlink' onclick='create()'>CREATE!</div>
        </div>
        <div class='dtop' oncontextmenu="return false"> 
            <div id='listbox'>
        <div id='scrollbox'>
<?php        
    foreach ($gamesList as $entry) {
        echo "<div id='g" . $entry[0]. "' class='gameEntry' onclick='selectGameQuery(" . $entry[0] . ")'>" .
                "<div class='gameNo'>" . $entry[0] . "</div>" .
                "<div class='gameDifficulty'>" . diff(intval($entry[1])) . "</div>" .
                "<div class='gameDate'>" . gdate($entry[2]) . "</div>" .
            "</div>";
    }     
    echo "</div><div id='crframe'><div id='credenza'><div id='handle' onclick='lift()'><img class='handle' src='bighandle.png'></div></div></div></div><div id='mainbox'>";
    for ($row=0;$row<10;$row++){
        for ($col=0;$col<10;$col++){
            switch ($row){
            case 0:
                switch ($col){
                case 0:
                    echo doJunction(0,0,'0110');
                    break;
                case 9: 
                    echo doJunction(0,9,'0011');
                    break;
                default:
                    $top = 5;
                    $left = 5+65*$col;
                    if (eqCD(0,$col,$grid)){
                        echo doJunction(0,$col,'0101');
                    } else {
                        echo doJunction(0,$col,'0111');                
                    };
                };
                break;
            case 9:
                switch ($col){
                case 0:
                    echo doJunction(9,0,'1100');
                    break;
                case 9: 
                    echo doJunction(9,9,'1001');
                    echo drawcell(9,9,$grid);
                    break;
                default:
                    $top = 590;
                    $left = 5+65*$col;
                    echo drawcell(9,$col,$grid);
                    if (eqAB(9,$col,$grid)){
                        echo doJunction(9,$col,'0101');
                    } else {
                        echo doJunction(9,$col,'1101');
                        echo doVbar(9,$col);
                    };
                };
                break;
            default:               
                switch ($col){
                case 0:
                    if (eqBC($row,0,$grid)){
                        echo doJunction($row,0,'1010');
                    } else {
                        echo doJunction($row,0,'1110');
                    };
                    break;
                case 9: 
                    if (eqDA($row,9,$grid)){
                        echo doJunction($row,9,'1010');
                    } else {
                        echo doJunction($row,9,'1011');
                        echo doHbar($row,9);
                    };
                    echo drawcell($row,9,$grid);
                    break;
                default:
                    echo drawcell($row,$col,$grid);
                    if (eqAB($row,$col,$grid)){
                        $j = "0";
                    } else {
                        $j = "1";
                        echo doVbar($row,$col);
                    };
                    if (eqBC($row,$col,$grid)){
                        $j .= "0";
                    } else {
                        $j .= "1";
                    };
                    if (eqCD($row,$col,$grid)){
                        $j .= "0";
                    } else {
                        $j .= "1";
                    };
                    if (eqDA($row,$col,$grid)){
                        $j .= "0";
                    } else {
                        $j .= "1";
                        echo doHbar($row,$col);
                    };
                    if ($j != "0000"){
                        echo doJunction($row,$col,$j);
                    };
                };
            };
        };
    };
    for ($i=0;$i<count($totals);$i++){
        echo doTbox($anchors[$i],$totals[$i],$i);
    };   
        ?>           
    <div class = 'popup'; id='popupbox'><br>
        <span id='msgtxt'>TEXT</span><br><br>
        <img id='msgimg'; src='graphics/notice.png'><br><br>
        <button type='button'; onclick='$(this).parent().hide();'>OK</button>
    </div>          
    <div class = 'popupq'; id='popupquery'><br>
        <span id='msgq'></span><br><br>
        <button type='button'; onclick='queryActionOK(this)'>OK</button>
        <button type='button'; onclick='queryActionCancel(this)'>Cancel</button>
    </div>
    </div>
    <div id='sidebox'>
            <div><br>
                <input id='posstot'; class='possent'; type='text'; onblur='setPoss()'>
                <span class='incl'> in </span>
                <input id='possct'; class='possent'; type='text'; onblur='setPoss()'>
           </div><br>
           <textarea id=poss></textarea><br>
            <div class='centre'><span class='incl'>Total selected: </span>
            <div id='total' class='possent space'>0</div></div>
            <button type='button' onclick='clearSelect()'>Clear selection</button>
    </div>
    
</div>
<div id='bottombar' oncontextmenu="return false">
<div id='stepbar'>
    <button type='button' onclick='restartGameQuery()'>Back to start</button>
    <button type='button' onclick='backStage()'>Go back one step</button></div>
<div id='bookmarksbar'><div id='bookmarks' class='bookmarkdata'></div>
    <button type='button' onclick='setNewBookmark()'>Set bookmark</button>
    <button type='button' onclick='backToBookmark()'>Back to last bookmark</button>
        </div>
<div id='showbar'><div class='pShow'>Show: </div>
  <div class='showlist' onclick='modeSelect(9)'>9</div>
  <div class='showlist' onclick='modeSelect(8)'>8</div>
  <div class='showlist' onclick='modeSelect(7)'>7</div>
  <div class='showlist' onclick='modeSelect(6)'>6</div>
  <div class='showlist' onclick='modeSelect(5)'>5</div>
  <div class='showlist' onclick='modeSelect(4)'>4</div>
  <div class='showlist' onclick='modeSelect(3)'>3</div>
  <div class='showlist' onclick='modeSelect(2)'>2</div>
  <div class='showlist' onclick='modeSelect(1)'>1</div>
  <div class='showlist' style="width:40px" onclick='modeSelect(0)'>ALL</div>
    </div>
</div></div></div>
</form>
</body>
</html>