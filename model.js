function MineSweeper(options) {
  var settings = $.extend({
    row: 9,
    col: 9,
    mine: 10
  }, options||{});
  
  this.row = settings.row;
  this.col = settings.col;
  var c = this.row * this.col;
  this.mine = settings.mine > (c / 3) ? c / 5: settings.mine;
  
  this.prepareBoard();
  this.buryMines();
  this.putHints();
}

MineSweeper.prototype.prepareBoard = function() {
  this.data = new Array(this.row);
  for (var i = 0; i < this.row; i++) {
    var r = new Array(this.col)
    for (var j = 0; j < this.col; j++)
      r[j] = 0;
    this.data[i] = r;
  }
}

MineSweeper.prototype.isOut = function (r, c) {
	return (r < 0 || r > this.row - 1 || c < 0 || c > this.col - 1);
};

MineSweeper.prototype.buryMines = function() {
  var count = this.row * this.col;
  
  // 生成随机不重复的数组
  var o = new Array(count);
  for (var i = 0; i < count; i++)
    o[i] = i;
  o.sort(function(){ return 0.5 - Math.random(); });
  
  this.minePos = o.slice(0,this.mine);
  this.unmarkPos = [];
  
  for (var i = 0; i < this.mine; i++) {
    var r = Math.floor(o[i] / this.col);
    var c = o[i] % this.col;
    this.data[r][c] = -1; // -1 代表一个地雷
  }
}

MineSweeper.prototype.putHints = function() {
  function getHint(row, col, m) {
    var sum = 0;
    for (var r = row - 1; r < row + 2; r++) {
      if (r < 0 || r >= m.row) continue;
      for (var c = col - 1; c < col + 2; c++) {
        if (c < 0 || c >= m.col) continue;
        if (m.data[r][c] == -1) sum++;
      }
    }    
    return sum;
  }
  
  for (var r = 0; r < this.row; r++)
    for (var c = 0; c < this.col; c++)
      if (this.data[r][c] != -1)
        this.data[r][c] = getHint(r, c, this);

}