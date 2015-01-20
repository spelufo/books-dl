# google books downloader / image scraper

This is a [node-webkit/nwjs](https://github.com/nwjs/nw.js/) application
that loads a google book via tha [viewer API](https://developers.google.com/books/docs/viewer/developers_guide),
and goes through the book, saving each page as a png when possible.

## Usage

Find out the id of the book you want from the book's url. To find books programmatically check out
the [Books API](https://developers.google.com/books/docs/v1/getting_started) or the [google-books-search](https://github.com/smilledge/node-google-books-search/) module
for a node interface to it.

```bash
git clone https://github.com/spelufo/books-dl.git && cd books-dl
npm install
node_modules/.bin/nw . <book-id> <output-directory>
```

Your book's images will be saved to `<output-directory>/<pg-num>-<pg-id>.png`.

If you want to speed the paging up or slow it down if images aren't loading
fast enough, tweak `index.js`.

## Contribute

This is not meant to be used for anything other than personal use. Nevertheless it could be more tolerant to errors.
Right now it crashes if it scrolls too fast and it can't load the images in time. Adjusting the interval is good
enough for me, but if someone comes up with a more robust solution, I'd like to hear about it.
Other than that it could benefit from allowing more options to be passed from the command line.
Contributions are welcome.

## Making of

It took a day to find a way do this. Scraping is never the most robust
way to do things, so I tried to avoid it, but run into other problems.

1. **Browser > Save Page As.. (Complete).** Doesn't work,
it saves only the images that are in sight. In fact, the only images that
are attached to the dom (`document.images`) at any moment are the few that
you can see, even after they all have loaded.

2. **Find image files in Browser Cache.** Too hard to do in batch. Presumably the stuff
in `~/.config/google-chrome/Default/Application Cache` is the cache, but it is a
mixture of binary files and sqlite3 databases... Moving on.

3. **Browse to get links + wget them.** I've found this technique for simple one time
scraping to be very easy and fast. You go to the page on the devtools, run all the js you
want on the dom to come up with the list of urls you want to wget. Then copy paste to a terminal and done.
Except it doesn't work, because SSH. Authentication fails. I tried exporting the browsers cookies to a file
but it didn't work either.

4. **Scraping with node webkit.** Success. Getting the images one at a time with the API
was easy. Next I needed to get the image's [data](https://developer.mozilla.org/en/docs/Web/API/ImageData)
and find out how to turn it into a nodejs buffer that I could save to disk.
Fortunately I found [node-png](https://github.com/leogiese/node-png) which encodes/decodes
png files from/to arrays of 0-255 RGB/RGBA values. After some lucky guessing I
found that all I had to do was set `png.data = imgdata.data`, and `png.pack().pipe(fs.createWriteStream(file));`.

