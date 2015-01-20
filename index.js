var $ = function (x) { return [].slice.call(document.querySelectorAll(x)) };
var PNG = require('node-png').PNG;
var fs = require('fs');

var makeImgDataGetter = function (canvas) {
  return function (img) {
    canvas.setAttribute('width', img.width)
    canvas.setAttribute('height', img.height)
    var context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, img.width, img.height);
  }
}
var canvas = document.createElement("canvas");
var getImageData = makeImgDataGetter(canvas);


function getPageImage() {
  var id = viewer.getPageId()
  var num = viewer.getPageNumber()
  var img = $('#viewerCanvas img').filter(function (el) {
    return (new RegExp(id)).test(el.src);
  })[0];
  if (!img) return null;
  var res = getImageData(img);
  res.id = id;
  res.num = num;
  return res;
}

var prevId;
function nextPage() {
  var img = getPageImage();
  if (img) {
    var png = new PNG({ width: img.width, height: img.height})
    var file = outdir+'/'+img.num+'-'+img.id+'.png'
    png.data = img.data;
    png.pack().pipe(fs.createWriteStream(file));
  }
  prevId = viewer.getPageId();
  viewer.nextPage();
  if (viewer.getPageId() === prevId)
    alert('Done')
  else
    window.setTimeout(nextPage, 1000)
    // window.setTimeout(nextPage, 700 + Math.floor(Math.random()*1000))
}



var bookid = require('nw.gui').App.argv[0];
if (!bookid) {
  process.stderr.write('\nMissing <book-id> argument:\n')
  process.stderr.write('Usage:\n\tnw . <book-id>\n# See Supported Identifiers at https://developers.google.com/books/docs/viewer/developers_guide\n')
  process.exit(1);
}

var outdir;
fs.mkdirSync(outdir = './books/'+bookid)

var viewer;
google.load("books", "0");
google.setOnLoadCallback(function initialize() {
  viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
  viewer.load(bookid);
  setTimeout(nextPage, 5000);
})