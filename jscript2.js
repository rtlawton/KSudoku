/*jslint browser: true*/
/*jslint plusplus: true */
/*global $, jQuery, expandAccounts, alert, confirm */

/**
 * @author Richard Lawton
 */
"use strict";
var selecting = false,
    blocks = [],
    totals = [],
    sympair,
    cz = [],
    blurable = false,
    cbf;
function closeBox() {
    $('#screen').hide();
    $('#popupbox').hide();
    cbf();
}
function showmsg(txt, nclass, callBack) {
    $('#popupbox').removeClass();
    $('#popupbox').addClass('popup');
    $('#popupbox').addClass(nclass);
    $('#msgtxt').html(txt);
    $('#msgimg').attr('src', 'graphics/' + nclass + '.png');
    $('#screen').show();
    $('#popupbox').show();
    cbf = callBack;
}
function impossible(n, t) {
    var tmin = (n * (n + 1)) / 2,
        tmax = (10 * n) - tmin;
    return (t < tmin || t > tmax);
}
function opposite(c) {
    var row = $(c).data("row"),
        col = $(c).data("col");
    switch ($("#symm").val()) {
    case "hor":
        return $('#c' + (10 - row) + col)[0];
    case "vert":
        return $('#c' + row + (10 - col))[0];
    case "diag":
        return $('#c' + (10 - col) + (10 - row))[0];
    case "spin":
        return $('#c' + (10 - row) + (10 - col))[0];
    }
}
function v(b1, b2) {
    if (b1 === b2) {
        return "0";
    } else {
        return "1";
    }
}
function getJunction(b1, b2, b3, b4) {
    return "graphics/J" + v(b1, b2) + v(b2, b3) + v(b3, b4) + v(b4, b1) + ".png";
}

function drawBoundaries() {
    var cs = blocks[blocks.length - 1], i, r, c, b, b11, b12, b13, b21, b23, b31, b32, b33, $top, $left;
    for (i = 0; i < cs.length; i++) {
        r = $(cs[i]).data("row");
        c = $(cs[i]).data("col");
        b = $(cs[i]).data("block");
        b11 = b12 = b13 = b21 = b23 = b31 = b32 = b33 = -1;
        if (r > 1) {
            b12 = $('#c' + (r - 1).toString() + c.toString()).data("block");
            if (c > 1) {
                b11 = $('#c' + (r - 1).toString() + (c - 1).toString()).data("block");
            }
            if (c < 9) {
                b13 = $('#c' + (r - 1).toString() + (c + 1).toString()).data("block");
            }
        }
        if (r < 9) {
            b32 = $('#c' + (r + 1).toString() + c.toString()).data("block");
            if (c > 1) {
                b31 = $('#c' + (r + 1).toString() + (c - 1).toString()).data("block");
            }
            if (c < 9) {
                b33 = $('#c' + (r + 1).toString() + (c + 1).toString()).data("block");
            }
        }
        if (c > 1) {
            b21 = $('#c' + r.toString() + (c - 1).toString()).data("block");
        }
        if (c < 9) {
            b23 = $('#c' + r.toString() + (c + 1).toString()).data("block");
        }
        if (b12 === 0) {
            $("#H" + (r - 1).toString() + c.toString()).addClass('backRed');
        }
        if (b32 === 0) {
            $("#H" + r.toString() + c.toString()).addClass('backRed');
        }
        if (b21 === 0) {
            $("#V" + r.toString() + (c - 1).toString()).addClass('backRed');
        }
        if (b23 === 0) {
            $("#V" + r.toString() + c.toString()).addClass('backRed');
        }
        $('#J' + (r - 1).toString() + (c - 1).toString()).attr("src", getJunction(b11, b12, b, b21));
        $('#J' + (r - 1).toString() + c.toString()).attr("src", getJunction(b12, b13, b23, b));
        $('#J' + r.toString() + c.toString()).attr("src", getJunction(b, b23, b33, b32));
        $('#J' + r.toString() + (c - 1).toString()).attr("src", getJunction(b21, b, b32, b31));
        
    }
}
function processSelection() {
    var tdiv = $("<div contenteditable class='totin2' onkeypress='return getTotal(event)'></div>"),
        cs = $(".scell");
    blocks.push(cs);
    $(cs).data("block", blocks.length);
    drawBoundaries();
    $(cs).addClass("ncell");
    $(cs).removeClass("scell");
    $(".totin").show();
    $("#screen").show();
    $("#mainboxcreate").append(tdiv);
    $(tdiv).focus();
}
function moveToFirstCell(cs, tbox) {
    var r = $(cs[0]).data("row"),
        c = $(cs[0]).data("col"),
        i,
        r2,
        c2,
        $top,
        $left;
    for (i = 1; i < cs.length; i++) {
        r2 = $(cs[i]).data("row");
        c2 = $(cs[i]).data("col");
        if (r2 < r) {
            r = r2;
            c = c2;
        } else if (r2 === r) {
            if (c2 < c) {
                c = c2;
            }
        }
    }
    $top = -6 + 65 * (r - 1);
    $left = -8 + 65 * (c - 1);
    $(tbox).animate({
        "top" : $top,
        "left" : $left,
        "fontSize" : "10px",
        "height" : "12px",
        "width" : "16px"
    }, 500, function () {
        $(".totin").hide();
        $("#screen").hide();
        $(tbox).attr("contenteditable", false);
        $(tbox).attr("id", "t" + totals.length.toString());
        if (sympair === 1 && $("#symm").val() !== "none") {
            $(cz).addClass('scell');
            sympair = 2;
            processSelection();
        }
    });
}
function checkReady() {
    if ((!$("#gameid").hasClass('red')) && $(".dcell").length === 81 && $("#createtotno").html() === "405") {
        $("#saveplay").prop("disabled", false);
        $("#savestay").prop("disabled", false);
    } else {
        $("#saveplay").prop("disabled", true);
        $("#savestay").prop("disabled", true);
    }
}
function getTotal(e) {
    if (e.keyCode > 57) {
        return false;
    }
    if (e.keyCode > 47) {
        return true;
    }
    if (e.keyCode === 13) {
        var tb = e.target,
            t = parseInt($(tb).html(), 10),
            c = blocks[blocks.length - 1].length,
            i;
        if (impossible(c, t)) {
            showmsg("Not possible!", "warning");
            return false;
        }
        totals.push($(tb).html());
        $("#createtotno").html(parseInt($("#createtotno").html(), 10) + t);
        moveToFirstCell(blocks[blocks.length - 1], tb);
        $(blocks[blocks.length - 1]).removeClass("ncell");
        $(blocks[blocks.length - 1]).addClass("dcell");
        checkReady();
        return false;
    }
    return false;
}


function clearBoundaries(b) {
    var cs = blocks[b - 1], i, r, c, b11, b12, b13, b21, b23, b31, b32, b33, $top, $left;
    $(cs).data("block", 0);
    for (i = 0; i < cs.length; i++) {
        r = $(cs[i]).data("row");
        c = $(cs[i]).data("col");
        b11 = b12 = b13 = b21 = b23 = b31 = b32 = b33 = -1;
        if (r > 1) {
            b12 = $('#c' + (r - 1).toString() + c.toString()).data("block");
            if (c > 1) {
                b11 = $('#c' + (r - 1).toString() + (c - 1).toString()).data("block");
            }
            if (c < 9) {
                b13 = $('#c' + (r - 1).toString() + (c + 1).toString()).data("block");
            }
        }
        if (r < 9) {
            b32 = $('#c' + (r + 1).toString() + c.toString()).data("block");
            if (c > 1) {
                b31 = $('#c' + (r + 1).toString() + (c - 1).toString()).data("block");
            }
            if (c < 9) {
                b33 = $('#c' + (r + 1).toString() + (c + 1).toString()).data("block");
            }
        }
        if (c > 1) {
            b21 = $('#c' + r.toString() + (c - 1).toString()).data("block");
        }
        if (c < 9) {
            b23 = $('#c' + r.toString() + (c + 1).toString()).data("block");
        }
        if (b12 === 0) {
            $("#H" + (r - 1).toString() + c.toString()).removeClass('backRed');
        }
        if (b32 === 0) {
            $("#H" + r.toString() + c.toString()).removeClass('backRed');
        }
        if (b21 === 0) {
            $("#V" + r.toString() + (c - 1).toString()).removeClass('backRed');
        }
        if (b23 === 0) {
            $("#V" + r.toString() + c.toString()).removeClass('backRed');
        }
        $('#J' + (r - 1).toString() + (c - 1).toString()).attr("src", getJunction(b11, b12, 0, b21));
        $('#J' + (r - 1).toString() + c.toString()).attr("src", getJunction(b12, b13, b23, 0));
        $('#J' + r.toString() + c.toString()).attr("src", getJunction(0, b23, b33, b32));
        $('#J' + r.toString() + (c - 1).toString()).attr("src", getJunction(b21, 0, b32, b31));
        
    }
    
}
function deselect(c) {
    var b = $(c).data("block"),
        b2;
    $("#createtotno").html($("#createtotno").html() - totals[b - 1]);
    totals[b - 1] = 0;
    $("#t" + b.toString()).remove();
    clearBoundaries(b);
    $(blocks[b - 1]).removeClass("dcell");
    blocks[b - 1] = [];
    if ($("#symm").val() !== "none") {
        b = $(opposite(c)).data("block");
        if (b !== 0) {
            $("#createtotno").html($("#createtotno").html() - totals[b - 1]);
            totals[b - 1] = 0;
            $("#t" + b.toString()).remove();
            clearBoundaries(b);
            $(blocks[b - 1]).removeClass("dcell");
            blocks[b - 1] = [];
        }
    }
}

function startup() {
    $(".totin").hide();
    $('#popupbox').hide();
    $('#savestay').prop("disabled", true);
    $('#saveplay').prop("disabled", true);
    $('#screen').hide();
    $('#ksdo').prop("data", "http://www.killersudokuonline.com/");
}
function startselect(c) {
    $("#symm").prop("disabled", true);
    if ($(c).hasClass('dcell')) {
        deselect(c);
        selecting = false;
    } else {
        $(c).addClass('scell');
        selecting = true;
    }
}
function endselect() {
    if (selecting) {
        selecting = false;
        if ($("#symm").val() !== "none") {
            cz  = $(".scell").map(function () {
                return opposite($(this));
            });
            switch ($(cz).filter('.scell').length) {
            case 0:
                sympair = 1;
                break;
            case cz.length:
                sympair = 2;
                break;
            default:
                showmsg('Illegal: breaks symmetry', 'warning', function () {
                    $(".scell").removeClass("scell");
                });
                return false;
            }
        } else {
            cz = [];
            sympair = 1;
        }
        processSelection();
    }
}
function doselect(c) {
    if (selecting && !$(c).hasClass('dcell')) {
        $(c).addClass('scell');
    }
}
function unique() {
    if (blurable) {
        $.get("unique.php", {gm: $("#gameid").html()}, function (data) {
            if (data !== "true") {
                showmsg("Duplicate number", "warning", function () {
                    $("#gameid").addClass('red');
                });
            } else {
                
                $("#gameid").removeClass('red');
            }
            blurable = false;
            checkReady();
        });
    }
    
    return false;
}
function gmnoenter(e) {
    if (e.keyCode > 57) {
        return false;
    }
    if (e.keyCode > 47) {
        blurable = true;
        return true;
    }
    if (e.keyCode === 13) {
        unique();
        return false;
    }
}
function creset() {
    location.reload(true);
}

function saveGame(nxt) {
    var frame = "",
        b,
        c,
        dt,
        jqxhr;
    for (b = 0; b < blocks.length; b++) {
        if (totals[b] !== 0) {
            frame += totals[b].toString();
            for (c = 0; c < blocks[b].length; c++) {
                frame += " " + (9 * $(blocks[b][c]).data("row") - 9 + $(blocks[b][c]).data("col")).toString();
            }
            frame += "> ";
        }
    }
    $.post("save.php", { gm: $("#gameid").html(), fr: frame.trim(), diff: $("#cdiff option:selected").val()}, function (ret) {
        if (ret === "success") {
            showmsg("New game saved", "success", function () {
                if (nxt === "play") {
                    window.location.href = "main.php?q=" + $("#gameid").html();
                } else {
                    location.reload(true);
                }
            });
        } else {
            showmsg("Failed", "warning");
        }
    });
}