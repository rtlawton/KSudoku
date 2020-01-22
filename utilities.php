<?php

require_once('config.php');

function getcell($row, $col){
    return ('c' . $row . $col);
};

function getbox($row, $col){
    return 1 + 3*floor(($row-1)/3) + floor(($col-1)/3);
};

function gridPos($row,$col){
    return 9*($row-1)+$col;
};

function boxcolor($box){
  if ($box % 2 == 0) {
      return 'evencolor';
  } else {
      return 'oddcolor';
  };
};
function drawcell($row,$col,$grid){
    $top = 65*($row-1);
    $left = 65*($col-1);
    $cell = "<div contenteditable id='" . getcell($row,$col) . "'; style='top:" . (string)$top . "px;left:" . (string)$left . "px'; onfocus='this.oldvalue = this.innerHTML;' onkeyup='idleset(this)'; onblur='update(this)'; onclick='clickcell(this)'; ondblclick='propagate(this)'; oncontextmenu='toggleBlock(this);window.getSelection().removeAllRanges();return false'; data-col='" . (string)$col . "'; data-row='" . (string)$row . "'; data-box='" . (string)(getbox($row,$col)) . "'; data-block='" . (string)($grid[9*($row-1)+$col]) . "'; class='cell " . boxcolor(getbox($row,$col));
    if($col==9){
        $cell .= " rightedge";
    };
    if($row==9){
        $cell .= " bottomedge";
    };
    $cell .= "'>123456789</div>";
    return $cell;
};
function doVbar($row,$col){
    $top = 65*($row-1);
    $left = -5+65*$col;
    return "<div class='vbar backRed'; style='top:" . (string)$top . "px;left:" . (string)$left . "px'></div>";
};
function doHbar($row,$col){
    $top = -5+65*$row;
    $left = 65*($col-1);
    return "<div class='hbar backRed'; style='top:" . (string)$top . "px;left:" . (string)$left . "px'></div>";
};
function doJunction($row,$col,$graph){
    $top = -8+65*$row;
    $left = -8+65*$col;
    return "<img src='graphics\J" . $graph . ".png' width=11 height=11 style='position:absolute; top:" . (string)$top . "px;left:" . (string)$left . "px'>";
};
function parseFrame($dbFrame){
    $grid = array_fill(1,81,'x');
    $totals = array();
    $anchors = array();
    $blocks = explode('>',chop($dbFrame,'>'));
    for ($i=0;$i < count($blocks);$i++){
        $cells = explode(' ',ltrim($blocks[$i]));
        for ($j=0;$j < count($cells);$j++){
            if (! is_numeric($cells[$j])){
                die('non-numeric character in frame: ' . (string)$cells[$j] . (string)$j . (string)$i);
            };
        };
        array_push($totals,$cells[0]);
        $tails = array_slice($cells,1);
        sort($tails,SORT_NUMERIC);
        array_push($anchors,$tails[0]);
        for ($j=1;$j < count($cells);$j++){
            $grid[(int)$cells[$j]]=(string)($i+1);
        };
        
    };
    for ($i=1;$i<82;$i++){
        if ($grid[$i] == 'x'){
            die('cell missing from frame: ' . (string)$i);
        };
    };
    if (array_sum($totals) != 405){
        die('frame total incorrect: ' . (string)array_sum($totals));
    };
    return array($grid,$totals,$anchors);
};

function eqAB($row,$col,$grid){
    return ($grid[9*($row-1)+$col] == $grid[9*($row-1)+$col+1]);
};
function eqBC($row,$col,$grid){
    return ($grid[9*($row-1)+$col+1] == $grid[9*($row)+$col+1]);
};
function eqCD($row,$col,$grid){
    return ($grid[9*($row)+$col+1] == $grid[9*($row)+$col]);
};
function eqDA($row,$col,$grid){
    return ($grid[9*($row)+$col] == $grid[9*($row-1)+$col]);
};
function doTbox($anchor,$total,$i){
    $row = 1+floor((($anchor)-1)/9);
    $col = $anchor - 9*($row-1);
    $top = -6+65*($row-1);
    $left = -8+65*($col-1);
    return "<div id='t" . (string)($i+1) ."'; class='tBox'; data-block='" . (string)($i+1) ."'; style='top:" . (string)$top . "px;left:" . (string)$left . "px'; onclick='tSelect(this)'>" . $total . "</div>";
};
function diff($n) {
    switch($n) {
        case 0: return "Easy";
        case 1: return "Moderate";
        case 2: return "Hard";
        case 3: return "Extreme";
        case 4: return "Outrageous";
        case 5: return "Mind bending";
        default: return "Undefined";
    }
}
function gdate($dt) {
    return substr($dt,8,2) . '-' . substr($dt,5,2) . '-' . substr($dt,0,4);
}
?>