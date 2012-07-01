var ldict = [{row: 3, col: 3, mine: 2},
              {row: 9, col: 9, mine: 10},
              {row: 16, col: 16, mine: 40},
              {row: 16, col: 30, mine: 99}];
var colordict = ['#000066', '#800000', '#003300', '#660066', '#663300'];
var st = 0;
var rm = 0;
var m;
var tida = null;
var bombchar = '\u2622';
var markchar = '\u2658';

function cell2pos(cell) {
  /^cl([\d]{2})([\d]{2})$/.test(cell.attr('id'));
  var r = eval(RegExp.$1);
  var c = eval(RegExp.$2);
  return [r, c];
}
function cell2pos1(cell) {
  /^cl([\d]{2})([\d]{2})$/.test(cell.attr('id'));
  var r = eval(RegExp.$1);
  var c = eval(RegExp.$2);
  return r*m.col+c;
}
function pos2cell(r, c) {
  return $(pos2cellid(r, c));
}
function pos2cellid(r, c) {
  return ('#cl'+((r<10)?('0'+r):(''+r))+ ((c<10)?('0'+c):(''+c)));
}

function clickGrid(e) {
  var source = $(e.target);
  var btn = e.which;
  var pos = cell2pos(source);
  var v = m.data[pos[0]][pos[1]];
  
  switch (btn) {
  case 1: // 左键按下
    if (source.hasClass('turned') || source.hasClass('marked')) return;
    if(turnCell(source, v)) return;
    break;
  case 2: // 中键按下
    if (!/\d*/.test(source.text())) return;
    var r = pos[0];
    var c = pos[1];
    var alist = [[r-1,c],[r+1,c],[r,c-1],[r,c+1],[r-1,c+1],[r-1,c-1],[r+1,c+1],[r+1,c-1]];
    var around = $($.map(alist, function(pos) {
      return pos2cellid(pos[0], pos[1]);
    }).join(',')).not('.turned');
    if (around.filter('.marked').size() == eval(source.text())) {
      around.not('.marked').each(function () {
        $this = $(this);
        var sop = cell2pos($this);
        turnCell($this, m.data[sop[0]][sop[1]]);
      });
    } else {
      around.stop().removeAttr('style').effect("highlight", {}, 1000);
    }
    break;
  case 3: // 右键按下
    if (source.hasClass('turned')) return;
    toggleMark(source, v);
    break;
  }
  
  // 判断游戏结束
  if (1) {
    // 错误标记的个数
    var n = $('td.marked').filter(function () {
      return $.inArray(cell2pos1($(this)), m.minePos) == -1;
    }).size();
    // 剩余未翻格数
    var rest = $('#gametable td').not('.marked').not('.turned').size();
    
    if (n == 0 && rest == rm) {
      clearInterval(tida);
      $('#gametable td').not('.marked').not('.turned').each(function() {
        var pos = cell2pos($(this));
        var value = m.data[pos[0]][pos[1]];
        $(this).addClass('turned');
        if (value == -1) {
          $(this).removeClass('turned').addClass('marked').text(markchar);
          $('#restmine').text(--rm);
        } else if (value != 0) {
          $(this).css('color', colordict[value+1]).text(value);
        }
      });
      $("<div id='diag'>").html('<p>Bazinga!</p>').height($('#gametable').height()).css({opacity: 0.8, color: '#00ff00'}).hide().prependTo($('#gameboard')).fadeIn(500);
    }
  }
}

function toggleMark(cell, v) {
  if (cell.hasClass('marked')) {
    cell.removeClass('marked').addClass('confused').text('?');
    $('#restmine').text(++rm);
  } else if (cell.hasClass('confused')) {
    cell.removeClass('confused').text('');
  } else {
    cell.addClass('marked').text(markchar);
    $('#restmine').text(--rm);
  }
  
}

function turnCell(cell, value) {
  if (value == -1) {
    boom(cell, m);
    setTimeout(function () {
      $("<div id='diag'>").html('<p>Opps~</p>').height($('#gametable').height()).css('opacity', 0.8).hide().prependTo($('#gameboard')).fadeIn(500);}, 2000);
      return true;
  } else if (value == 0) {
    var pos = cell2pos(cell);
    blankFlood (pos[0], pos[1], m)
  } else {
    cell.addClass('turned');
    cell.css('color', colordict[value+1]).text(value);
  }
  return false;
}

function boom(cell, m) {
  clearInterval(tida);
  var mines = $($.map(m.minePos, function(pos) {
    var r = Math.floor(pos / m.col);
    var c = pos % m.col;
    return pos2cellid(r, c);
  }).join(','));
  cell.addClass('turned bomb').text(bombchar).jrumble().trigger('startRumble');
  mines.not(cell).each(function(i) {
      var cur = $(this);
      setTimeout(function (e) {
        cur.addClass('turned bomb').text(bombchar).not('.marked').jrumble().trigger('startRumble');
      }, 500 + 1000*(1-1.3*Math.pow(Math.E, -i)));
    });
}

function blankFlood (row, col, m) {
    var fill_list = [];
    fill_list.push([row,col]);
    while(fill_list.length > 0) {
      curpos = fill_list.shift();
      var r = curpos[0];
      var c = curpos[1];
      if (m.isOut(r, c))
        continue;
      var cell = pos2cell(r, c);
      if (!cell.hasClass('turned') && !cell.hasClass('marked')) {
        cell.text('');
        cell.addClass('turned');
        var v = m.data[r][c];
        if (v == 0) {
          fill_list.push([r-1,c]);
          fill_list.push([r+1,c]);
          fill_list.push([r,c-1]);
          fill_list.push([r,c+1]);
          // 以下考虑八连通
          fill_list.push([r-1,c+1]);
          fill_list.push([r-1,c-1]);
          fill_list.push([r+1,c+1]);
          fill_list.push([r+1,c-1]);
        } else 
          cell.css('color', colordict[v+1]).text(v);
      }
    }
}

function newGame() {
  clearInterval(tida);
  st = 0; rm = 0;
  var level = $('#level').val();
  m = new MineSweeper(ldict[level]);
  rm = m.mine;
  
  $('#diag').remove();
  var th = $("#gametable").html('');
  for (var r = 0; r < m.row; r++) {
    var rh = $('<tr>');
    for (var c = 0; c < m.col; c++) {
      var tdclass = 'cl'+((r<10)?('0'+r):(''+r))+ ((c<10)?('0'+c):(''+c));
      $('<td>').attr('id', tdclass)
        .mouseup(clickGrid)
        .bind("contextmenu",function(e){return false; })
        .bind("onmousewheel", function(e) {return false; })
        .appendTo(rh);
    }
    th.append(rh);
  }
  // 开始计时
  th.one('mouseup', function(e) {
      // console.log("solution: "+$(e.target).attr('id'));
      st = 0;
      tida = setInterval(function() {
        st++;
        $('#spendtime').text(st);
      }, 1000);
    });
  
  $('#spendtime').text(st);
  $('#restmine').text(rm);
}

$(function(){
  $('#newgame').click(newGame);
});