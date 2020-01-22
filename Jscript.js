/*jslint browser: true*/
/*jslint plusplus: true */
/*global $, localStorage, document, alert, window */
/*exported  toggleBlock, clickcell, lift, startup, setNewBookmark, backToBookmark, backStage, propagate, tSelect, idleset, modeSelect, selectGameQuery, restartGameQuery, queryActionOK, queryActionCancel, gotoStart, create */

/**
 * @author Richard Lawton
 */
var rows = [0, [], [], [], [], [], [], [], [], []],
    cols = [0, [], [], [], [], [], [], [], [], []],
    boxes = [0, [], [], [], [], [], [], [], [], []],
    blocks = [0],
    totals = [0],
    counts = [0],
    cells = [],
    tots = [],
    total,
    selectedTotal = 0,
    selectedCount = 0,
    mode = 0,
    clickprocess = false,
    bookmarks = [],
    newGame,
    queryFunction,
    cancelFunction,
    updateTimer,
    modeamended = false;

//le 
//after user editing of cell restore to normal form, removing non-digits, duplicates...
function normalise(st) {
    "use strict";
    var pres = [false, false, false, false, false, false, false, false, false],
        outst = "",
        i,
        c;
    for (i = 0; i < st.length; i++) {
        c = st.charCodeAt(i);
        if (c > 48 && c < 58) {
            pres[c - 49] = true;
        }
    }
    for (i = 1; i < 10; i++) {
        if (pres[i - 1]) {
            outst += i;
        }
    }
    return outst;
}
//utility to retrieve bookmarks...
function getBookmarks() {
    "use strict";
    var b = localStorage.getItem("bookmarks");
    if (b === "") {
        bookmarks = [];
    } else {
        bookmarks = b.split(',');
    }
    $("#bookmarks").html("Bookmarks: " + bookmarks.length);
}
//utility to save bookmarks
function setBookmarks() {
    "use strict";
    localStorage.setItem("bookmarks", bookmarks.join());
    $("#bookmarks").html("Bookmarks: " + bookmarks.length);
}
function clearBookmarks() {
    "use strict";
    localStorage.setItem("bookmarks", "");
    $("#bookmarks").html("Bookmarks: 0");
    bookmarks = [];
    
}
//utility to read a cookie
function getCookie(cname) {
    "use strict";
    var name = cname + "=",
        decodedCookie = decodeURIComponent(document.cookie),
        ca = decodedCookie.split(';'),
        i,
        c;
    for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
//utility to set a cookie
function setCookie(cname, cvalue) {
    "use strict";
    var d = new Date(),
        expires;
    d.setTime(d.getTime() + (1314000000));
    expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
//utility for checkdone() identify duplicated singles in row, cols, boxes etc.
function duplicates(s) {
    "use strict";
    var i, j;
    for (i = 1; i < s.length - 1; i++) {
        for (j = i + 1; j < s.length; j++) {
            if ($(s[i]).html() === $(s[j]).html()) {
                return true;
            }
        }
    }
    return false;
}
//check whether solution has been achieved
function checkDone() {
    "use strict";
    var singles = $(cells).filter(".singleton"),
        i;
    if (singles.length < 81) {
        return false;
    }
    for (i = 1; i < 10; i++) {
        if (duplicates(rows[i])) {
            return false;
        }
        if (duplicates(cols[i])) {
            return false;
        }
        if (duplicates(boxes[i])) {
            return false;
        }
    }
    for (i = 1; i < blocks.length; i++) {
        if (duplicates(blocks[i])) {
            return false;
        }
    }
    return true;
}
//customized alert box
function showmsg(txt, nclass) {
    "use strict";
    $('#popupbox').removeClass();
    $('#popupbox').addClass('popup');
    $('#popupbox').addClass(nclass);
    $('#msgtxt').html(txt);
    $('#msgimg').attr('src', 'graphics/' + nclass + '.png');
    $('#popupbox').show();
}
//check for any duplicate singletons in row, col, box or block
function isError() {
    "use strict";
    var singles = $(cells).filter(".singleton"),
        i,
        j;
    for (i = 0; i < singles.length - 1; i++) {
        for (j = i + 1; j < singles.length; j++) {
            if ($(singles[i]).html() === $(singles[j]).html()) {
                if ($(singles[i]).data("row") === $(singles[j]).data("row")) {
                    return true;
                }
                if ($(singles[i]).data("col") === $(singles[j]).data("col")) {
                    return true;
                }
                if ($(singles[i]).data("box") === $(singles[j]).data("box")) {
                    return true;
                }
                if ($(singles[i]).data("block") === $(singles[j]).data("block")) {
                    return true;
                }
            }
        }
    }
    return false;
}
//save the stage to local memory
function saveStage() {
    "use strict";
    var c = Number(localStorage.getItem("stageCount")) + 1,
        s = "",
        i,
        dt = new Date(),
        d;
    if (isError()) {
        showmsg("you've gone wrong!", "warning");
    } else if (checkDone()) {
        $.post("done.php", "gm=" + getCookie("game"), function () {});
        showmsg("Congratulations - success!", "success");
        d = ("0" + dt.getDate()).substr(-2, 2) + "-" + ("0" + (dt.getMonth() + 1)).substr(-2, 2) + "-" + dt.getFullYear();
        $("#g" + getCookie("game")).find(".gameDate").html(d);
    }
    for (i = 0; i < cells.length - 1; i++) {
        s += $(cells[i]).html() + ',';
    }
    s += $(cells[cells.length - 1]).html();
    localStorage.setItem("stageCount", c);
    localStorage.setItem("S" + c, s);
    $("#stage").html("Stage: " + c);
    setCookie("stage", c.toString());
}
//recursive utility used by possString() to process array of possible digit sequences totalling t with n digits from digit set d
function poss(t, n, d) {
    "use strict";
    var i, j, dp, res = [], tail, di;
    if (n === 1) {
        dp = d.search(t);
        if (dp > -1) {
            return [t];
        } else {
            return [];
        }
    } else {
        for (i = 0; i < d.length; i++) {
            di = parseInt(d.charAt(i), 10);
            if (di * n < t) {
                tail = poss(t - di, n - 1, d.slice(i + 1));
                for (j = 0; j < tail.length; j++) {
                    res.push(d.charAt(i) + tail[j]);
                }
            }
        }
        return res;
    }
}
//generate initial cell strings from block total and number of cells
function possString(t, n) {
    "use strict";
    var pst = poss(t, n, "123456789"), i, ost = "", xst = "";
    for (i = 0; i < pst.length; i++) {
        ost += pst[i];
    }
    for (i = 1; i < 10; i++) {
        if (ost.search(i) > -1) {
            xst += i;
        }
    }
    return xst;
}
//recursive utility used by showPoss() and setPoss() to generate possibilities from array of cell strings and total required
function possB(sList, t) {
    "use strict";
    var ret = [], retf = [], i, j, ai, ret2, tn, sList2;
    if (sList.length === 1) {
        if (t > 9) {
            return [];
        }
        if (sList[0].includes(t.toString())) {
            return [t.toString()];
        } else {
            return [];
        }
    }
    for (i = 0; i < sList[0].length; i++) {
        ai = sList[0].charAt(i);
        tn = t - Number(ai);
        if (tn > 0) {
            sList2 = sList.slice(1);
            for (j = 0; j < sList2.length; j++) {
                sList2[j] = sList2[j].replace(ai, '');
            }
            ret2 = possB(sList2, tn);
            for (j = 0; j < ret2.length; j++) {
                ret.push((ai + ret2[j]).split('').sort().join(''));
            }
        }
    }
    if (ret.length === 0) {
        return [];
    }
    ret.sort();
    retf = [ret[0]];
    for (i = 1; i < ret.length; i++) {
        if (ret[i] !== ret[i - 1]) {
            retf.push(ret[i]);
        }
    }
    return retf;
}
//utility for removing singletons from other cell in row, col, box, block when in singledigit display mode
function xpurgeSingle(set, s, id) {
    "use strict";
    var i, ns;
    for (i = 0; i < set.length; i++) {
        if ($(set[i]).attr('id') !== id) {
            ns = ($(set[i]).data('fulltext')).replace(s, '');
            $(set[i]).data('fulltext', ns);
            $(set[i]).html('');
            if (ns.length === 1) {
                $(set[i]).addClass('singleton');
            }
        }
    }
}
//check whether specified cell is singleton of value n in set
function isSingle(cell, set, n) {
    "use strict";
    var i;
    for (i = 0; i < set.length; i++) {
        if ($(cell).attr('id') !== $(set[i]).attr('id')) {
            if ($(set[i]).html().includes(n)) {
                return false;
            }
        }
    }
    return true;
}
//respond to user update of sidebar to display possibilities for requested t and n
function setPoss() {
    "use strict";
    var possstr = [], i, t = $("#posstot").val(), c = $("#possct").val(), dList, disp = '';
    if ($.isNumeric(t) && $.isNumeric(c)) {
        for (i = 0; i < c; i++) {
            possstr.push('123456789');
        }
        if (possstr.length === 0) {
            $("#poss").val(disp);
            return false;
        }
        dList = possB(possstr, Number(t));
        for (i = 0; i < dList.length; i++) {
            disp += dList[i].split('').join(' ') + '\n';
        }
        $("#poss").val(disp);
    }
}
//select or deselect a block
function toggleBlock(cell) {
    "use strict";
    var tr, cr, b, t;
    b = blocks[$(cell).data("block")];
    t = totals[$(cell).data("block")];
    if ($(b).hasClass('selected')) {
        $(b).removeClass('selected');
        selectedTotal -= Number(t);
        selectedCount -= b.length;
        $(total).html(selectedTotal.toString());
    } else {
        $(b).addClass('selected');
        selectedTotal += Number(t);
        selectedCount += b.length;
        $(total).html(selectedTotal.toString());
    }
    if (selectedTotal > 0) {
        tr = selectedTotal % 45;
        cr = selectedCount % 9;
        if (cr > 4) {
            cr = 9 - cr;
            tr = 45 - tr;
        }
        $("#posstot").val(tr);
        $("#possct").val(cr);
        setPoss();
    }
}

//process cell click when in single or multiple digit display mode
function clickcell(cell) {
    "use strict";
    var n = $(cell).html(),
        id = $(cell).attr("id"),
        r = $(cell).data("row"),
        c = $(cell).data("col"),
        b = $(cell).data("box"),
        bl = $(cell).data("block");
    if (mode === 0) {
        return false;
    }
    if (isSingle(cell, rows[r], n) || isSingle(cell, cols[c], n) || isSingle(cell, boxes[b], n)) {
        xpurgeSingle(rows[r], n, id);
        xpurgeSingle(cols[c], n, id);
        xpurgeSingle(boxes[b], n, id);
        xpurgeSingle(blocks[bl], n, id);
        $(cell).data("fulltext", n);
        $(cell).addClass('singleton');
    } else {
        if (n !== '') {
            $(cell).data("fulltext", $(cell).data("fulltext").replace(n, ''));
            $(cell).html('');
        }
    }
    modeamended = true;
    return false;
}
function syncStage(n) {
    "use strict";
    $("#stage").html("Stage: " + n.toString());
    localStorage.setItem("stageCount", n.toString());
}
//move to specific stage
function gotoStage(n) {
    "use strict";
    var c = Number(localStorage.getItem("stageCount")),
        s,
        i,
        st;
    if (mode > 0) {
        return false;
    }
    st = localStorage.getItem("S" + n);
    if (st === null) {
        alert("non-existent stage: " + n);
        return false;
    }
    s = st.split(',');
    for (i = 0; i < cells.length; i++) {
        $(cells[i]).html(s[i]);
        if (s[i].length === 1) {
            $(cells[i]).addClass('singleton');
        } else {
            $(cells[i]).removeClass('singleton');
        }
    }
    for (i = n + 1; i < c + 1; i++) {
        localStorage.removeItem("S" + i);
    }
    if (n === 1) {
        bookmarks = [];
        setBookmarks();
        $("#bookmarks").html("Bookmarks: " + bookmarks.length);
    }
    syncStage(n);
}
//initialize variables, save first stage
function lift() {
    "use strict";
    var t = -540 - $("#credenza").position().top,
        c;
    if (t === -540) {
        c = getCookie("credenzaScroll");
        if (c === "") {
            $("#scrollbox").scrollTop(0);
        } else {
            $("#scrollbox").scrollTop(parseInt(c, 10));
        }
    } else {
        setCookie("credenzaScroll", $("#scrollbox").scrollTop().toString());
    }
    $("#credenza").animate({top: t}, 5000);
}
function closeCredenza() {
    "use strict";
    setCookie("credenzaScroll", $("#scrollbox").scrollTop().toString());
    $("#credenza").animate({top: 0}, 5000);
}
function startup() {
    "use strict";
    var i, xst, smode, c;
    $('#popupbox').hide();
    $('#popupquery').hide();
    cells = $(".cell");
    tots = $(".tBox");
    total = $("#total");
    for (i = 0; i < tots.length; i++) {
        blocks.push([]);
        counts.push(0);
        totals.push(Number($(tots[i]).html()));
    }
    for (i = 0; i < cells.length; i++) {
        (rows[$(cells[i]).data("row")]).push(cells[i]);
        (cols[$(cells[i]).data("col")]).push(cells[i]);
        (boxes[$(cells[i]).data("box")]).push(cells[i]);
        (blocks[$(cells[i]).data("block")]).push(cells[i]);
        counts[$(cells[i]).data("block")] += 1;
    }
    for (i = 1; i < blocks.length; i++) {
        xst = possString(totals[i], counts[i]);
        $(blocks[i]).html(xst);
    }
    smode = getCookie("mode");
    c = getCookie("credenzaScroll");
    if (c === "") {
        $("#scrollbox").scrollTop(0);
    } else {
        $("#scrollbox").scrollTop(parseInt(c, 10));
    }
    if (smode === "CONTINUE") {
        gotoStage(localStorage.getItem("stageCount"));
        getBookmarks();
        $("#credenza").css({ top: '0px' });
    } else {
        localStorage.clear();
        localStorage.setItem("stageCount", 0);
        clearBookmarks();
        saveStage();
        window.onload = closeCredenza();
    }
    $("#game").html("Game: " + getCookie("game"));
    $("#stage").html("Stage: " + localStorage.getItem("stageCount"));
}
//move back a step
function setNewBookmark() {
    "use strict";
    var s = localStorage.getItem("stageCount");
    if (s === null) {
        alert('about to push empty bookmark');
    }
    bookmarks.push(s);
    setBookmarks();
}
function backToBookmark() {
    "use strict";
    var s;
    if (bookmarks.length === 0) {
        showmsg("No bookmarks set", "warning");
        return false;
    }
    s = bookmarks.pop();
    setBookmarks();
    if (s === "") {
        alert("Empty bookmark!");
        return false;
    }
    gotoStage(s);
}
function backStage() {
    "use strict";
    var c = Number(localStorage.getItem("stageCount")) - 1,
        s,
        i,
        ln;
    if (mode > 0) {
        return false;
    }
    if (c < 1) {
        showmsg("You're at the beginning!", "warning");
        return;
    }
    ln = bookmarks.length;
    if (ln > 0) {
        if (bookmarks[ln - 1] === localStorage.getItem("stageCount")) {
            bookmarks.pop();
            setBookmarks();
        }
    }
    s = localStorage.getItem("S" + c).split(',');
    for (i = 0; i < cells.length; i++) {
        $(cells[i]).html(s[i]);
        if (s[i].length === 1) {
            $(cells[i]).addClass('singleton');
        } else {
            $(cells[i]).removeClass('singleton');
        }
    }
    syncStage(c);
    localStorage.removeItem("S" + (c + 1));
}
//verify user input and normalize, reset if invalid, check for errors and save stage
function update(div) {
    "use strict";
    if (mode > 0) {
        return false;
    }
    window.clearTimeout(updateTimer);
    div.innerHTML = normalise(div.innerHTML);
    if (div.oldvalue !== div.innerHTML) {
        switch (div.innerHTML.length) {
        case 0:
            div.innerHTML = div.oldvalue;
            return false;
        case 1:
            div.classList.add("singleton");
            break;
        default:
            div.classList.remove("singleton");
        }
    } else {
        return false;
    }
    if (isError()) {
        showmsg("You've gone wrong. Undoing change...", "warning");
        div.innerHTML = div.oldvalue;
        if (div.innerHTML.length === 1) {
            div.classList.add("singleton");
        } else {
            div.classList.remove("singleton");
        }
        return false;
    } else {
        div.oldvalue = div.innerHTML;
        saveStage();
    }
    return false;
}

//utility used by propagate() to remove singleton digit from other cells in same set
function purgeSingle(set, s, id) {
    "use strict";
    var i,
        ns,
        changed = false;
    for (i = 0; i < set.length; i++) {
        if ($(set[i]).attr('id') !== id) {
            changed = changed || $(set[i]).html().includes(s);
            ns = ($(set[i]).html()).replace(s, '');
            $(set[i]).html(ns);
            if (ns.length === 1) {
                $(set[i]).addClass('singleton');
            }
        }
    }
    return changed;
}
//utility used by purgemultiple() to combine two strings and remove duplicate digits
function subtract(main, sub) {
    "use strict";
    var i;
    for (i = 0; i < sub.length; i++) {
        main = main.replace(sub.charAt(i), '');
    }
    return main;
}
//untility used by purgeMultiple() to identify disjoint sets of length n
function findDisjoint(n, nsf, ssf, rem, retind, ind) {
    "use strict";
    var i, sn = '', d2;
    for (i = ind; i < rem.length; i++) {
        d2 = $(rem[i]).html();
        if (d2.length <= n) {
            sn = normalise(ssf + d2);
            if (sn.length === n && nsf + 1 === n) {
                retind.push(i);
                return sn;
            }
            if (sn.length < nsf + 1) {
                showmsg("You've gone wrong!", "warning");
                return '';
            }
            if (nsf + 1 <  n && sn.length <= n && i + 1 < rem.length) {
                retind.push(i);
                sn = findDisjoint(n, nsf + 1, sn, rem, retind, i + 1);
                if (sn !== '') {
                    return sn;
                } else {
                    retind.pop();
                }
            }
        }
    }
    return '';
}
//utility used by propagate() to identify all disjoint subsets in a set
function purgeMultiple(set) {
    "use strict";
    var rem = set.slice(0), n = 1, sn, i, retind, ns, changed = false;
    while (n < rem.length) {
        do {
            retind = [];
            sn = findDisjoint(n, 0, '', rem, retind, 0);
            if (sn !== '') {
                changed = true;
                for (i = retind.length - 1; i >= 0; i--) {
                    rem.splice(retind[i], 1);
                }
                for (i = 0; i < rem.length; i++) {
                    ns = subtract($(rem[i]).html(), sn);
                    $(rem[i]).html(ns);
                    if (ns.length === 1) {
                        $(rem[i]).addClass('singleton');
                    }
                }
            }
        } while (sn !== '');
        n++;
    }
    return changed;
}
//identify hidden subsets of n digits which appear only in n cells, and remove all other digits from those cells
function purgeHidden(set) {
    "use strict";
    var sc = [], cell, dig, n, scs, newst, rv, i;
    rv = false;
    for (dig = 0; dig < 10; dig++) {
        sc.push(["000000000", dig]);
    }
    for (cell = 0; cell < 9; cell++) {
        for (dig = 1; dig < 10; dig++) {
            if ($(set[cell]).html().includes(dig.toString())) {
                sc[dig][0] = sc[dig][0].substring(0, cell) + '1' + sc[dig][0].substring(cell + 1, 9);
            }
        }
    }
    sc.shift().sort(function (a, b) {return a[0] < b[0]; });
    dig = 2;
    scs = [[sc[0]]];
    for (dig = 1; dig < 9; dig++) {
        if (sc[dig][0] === sc[dig - 1][0]) {
            (scs[scs.length - 1]).push(sc[dig]);
        } else {
            scs.push([sc[dig]]);
        }
    }
    for (i = 0; i < scs.length; i++) {
        n = 0;
        for (cell = 0; cell < 9; cell++) {
            if (scs[i][0][0].charAt(cell) === '1') {
                n++;
            }
        }
        if (n === scs[i].length) {
            newst = "";
            for (dig = 0; dig < n; dig++) {
                newst += scs[i][dig][1];
            }
            newst = newst.split('').sort().join('');
            for (cell = 0; cell < 9; cell++) {
                if (scs[i][0][0].charAt(cell) === '1') {
                    $(set[cell]).html(newst);
                    if (newst.length === 1) {
                        $(set[cell]).addClass('singleton');
                    }
                }
            }
            rv = true;
        }
    }
    return rv;
}
//respond to double click on cell to purge row, col, box and block from duplicated singeltons, disjoint subsets and hidden subsets
function propagate(div) {
    "use strict";
    var id = div.id,
        s = div.innerHTML,
        row = rows[div.getAttribute('data-row')],
        col = cols[div.getAttribute('data-col')],
        box = boxes[div.getAttribute('data-box')],
        block = blocks[div.getAttribute('data-block')],
        changed = false;
    if (mode > 0) {
        return false;
    }
    if (s.length === 1) {
        changed = purgeSingle(row, s, id) || changed;
        changed = purgeSingle(col, s, id) || changed;
        changed = purgeSingle(box, s, id) || changed;
        changed = purgeSingle(block, s, id) || changed;
        if (changed) {saveStage(); }
        return;
    } else {
        changed = purgeMultiple(row) || changed;
        changed = purgeMultiple(col) || changed;
        changed = purgeMultiple(box) || changed;
        changed = purgeMultiple(block) || changed;
    }
    changed = purgeHidden(row) || changed;
    changed = purgeHidden(col) || changed;
    changed = purgeHidden(box) || changed;
    if (changed) {saveStage(); }
    return;
}
//utility used by getPath to prepend digit 'k' to an array of strings 'as'
function preAdd(k, as) {
    "use strict";
    var i,
        re = [];
    for (i = 0; i < as.length; i++) {
        re.push(k + as[i]);
    }
    return re;
}
//recursive utility used by redundant() to generate array of possible digits for each cell
function getPath(pCells, t) {
    "use strict";
    var qCells = [],
        ret = [],
        i,
        j,
        k;
    if (pCells.length === 1) {
        if (pCells[0].includes(t.toString()) && t < 10) {
            return [t.toString()];
        } else {
            return [];
        }
    } else {
        for (i = 0; i < pCells[0].length; i++) {
            qCells = [];
            k = pCells[0].charAt(i);
            for (j = 1; j < pCells.length; j++) {
                qCells.push(pCells[j].replace(k, ''));
            }
            ret = ret.concat(preAdd(k, getPath(qCells, t - Number(k))));
        }
    }
    return ret;
}
//utility used by redundant() to convert array of cell objects to an aray of their html strings
function getHtml(a) {
    "use strict";
    var i,
        res = [];
    for (i = 0; i < a.length; i++) {
        res.push($(a[i]).html());
    }
    return res;
}
//identify redundant digits in cells in a block, colour then red, then remove after a short delay
function redundant(block, t) {
    "use strict";
    var b = blocks[block],
        validated = getPath(getHtml(b), t),
        bt,
        h,
        k,
        bcell,
        bchar,
        disp,
        found,
        changed = false;
    if (mode > 0) {
        return false;
    }
    if (validated.length === 0) {
        showmsg('You have gone wrong!', 'warning');
        for (k = 0; k < b.length; k++) {
            $(b[k]).html("<span class='red'>" + $(b[k]).html() + "</span>");
        }
        clickprocess = false;
        return false;
    }
    for (bcell = 0; bcell < b.length; bcell++) {
        bt = $(b[bcell]).html();
        h = '';
        for (bchar = 0; bchar < bt.length; bchar++) {
            found = false;
            for (k = 0; k < validated.length; k++) {
                if (validated[k].charAt(bcell) === bt.charAt(bchar)) {
                    found = true;
                    break;
                }
            }
            if (found) {
                h = h + bt.charAt(bchar);
            } else {
                h = h + "<span class='red'>" + bt.charAt(bchar) + "</span>";
                changed = true;
            }
        }
        $(b[bcell]).html(h);
    }
    for (k = 0; k < validated.length; k++) {
        validated[k] = validated[k].split('').sort().join('');
    }
    validated.sort();
    disp = validated[0].split('').join(' ') + '\n';
    for (k = 1; k < validated.length; k++) {
        if (validated[k] !== validated[k - 1]) {
            disp += validated[k].split('').join(' ') + '\n';
        }
    }
    $("#posstot").val(t);
    $("#possct").val(b.length);
    $("#poss").val(disp);
    if (changed) {
        $(b).find('.red').delay(300).fadeOut(300).promise().done(function () {
            $(b).find('.red').remove();
            for (bcell = 0; bcell < b.length; bcell++) {
                if ($(b[bcell]).html().length === 1) {
                    $(b[bcell]).addClass('singleton');
                }
            }
            saveStage();
            clickprocess = false;
            return;
        });
    } else {
        clickprocess = false;
    }
    return;
}
//clear block selection
function clearSelect() {
    "use strict";
    if (mode > 0) {
        return false;
    }
    $(".selected").removeClass("selected");
    $(total).html("0");
    selectedTotal = 0;
    selectedCount = 0;
   
}
//resopnd to click on total box:  remove redundant digits from block
function tSelect(tdiv) {
    "use strict";
    var block = tdiv.getAttribute('data-block');
    if (mode > 0 || clickprocess) {
        return false;
    }
    clearSelect();
    clickprocess = true;
    redundant(block, Number(tdiv.innerHTML));
    return;
}

//start timer onkeyup event for cell
function idleset(div) {
    "use strict";
    if (mode > 0) {
        return;
    }
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(function () {
        update(div);
    }, 1000);
}
//control display of single digits
function modeSelect(n) {
    "use strict";
    var i;
    if (mode === n || n === 0) {
        mode = 0;
        for (i = 0; i < cells.length; i++) {
            $(cells[i]).html($(cells[i]).data("fulltext"));
        }
        if (modeamended) {
            saveStage();
            modeamended = false;
        }
    } else {
        if (mode === 0) {
            for (i = 0; i < cells.length; i++) {
                $(cells[i]).data("fulltext", $(cells[i]).html());
                if ($(cells[i]).html().includes(n)) {
                    $(cells[i]).html(n);
                } else {
                    $(cells[i]).html('');
                }
            }
        } else {
            for (i = 0; i < cells.length; i++) {
                if ($(cells[i]).data("fulltext").includes(n)) {
                    $(cells[i]).html(n);
                } else {
                    $(cells[i]).html('');
                }
            }
        }
        mode = n;
    }
    return false;
}
function selectGame() {
    "use strict";
    setCookie("credenzaScroll", $("#scrollbox").scrollTop().toString());
    window.location.href = "main.php?q=" + newGame;
}
function selectGameQuery(n) {
    "use strict";
    newGame = n;
    if (checkDone()) {
        selectGame();
        return;
    }
    queryFunction = "selectGame";
    cancelFunction = "closeCredenza";
    $('#msgq').html('Current game will be closed. Continue?');
    $('#popupquery').show();
}
function restartGameQuery() {
    "use strict";
    queryFunction = "gotoStart";
    cancelFunction = "";
    $('#msgq').html('Current game will be restarted. Continue?');
    $('#popupquery').show();
}
function queryActionOK(button) {
    "use strict";
    $(button).parent().hide();
    window[queryFunction]();
}
function queryActionCancel(button) {
    "use strict";
    $(button).parent().hide();
    if (cancelFunction !== "") {
        window[cancelFunction]();
    }
}
function gotoStart() {
    "use strict";
    gotoStage(1);
    clearBookmarks();
}
function create() {
    "use strict";
    window.location.href = "create.php";
}
