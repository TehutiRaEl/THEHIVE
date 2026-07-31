Yo, so here's what's happening.

When your Node app reads that 2GB CSV file the normal way (like with `fs.readFileSync()` or just loading the whole file into a variable), Node tries to pull the **entire file into memory (RAM) all at once**, as one giant blob of data sitting inside the JavaScript engine (V8). But V8 gives your JS code a limited chunk of memory to work with — the "heap" — and by default that's roughly 1.5-4GB depending on your Node version, way less than you'd think, and definitely not comfortable when you're trying to shove a 2GB file in plus parse it into objects/arrays (which usually balloons the memory use even bigger than the raw file size). Once you hit that ceiling, Node throws `JavaScriptHeapOutOfMemory` and dies.

So your coworker's right — the fix is to **stream** it.

**What streaming actually means:** instead of loading the whole file into memory at once, you read it in small chunks, one piece at a time, process each chunk, and then let it go (garbage collect it) before grabbing the next chunk. Think of it like drinking a big lake through a straw instead of trying to swallow the whole lake in one gulp. At any given moment, only a small chunk (like 64KB) is actually sitting in memory — not the whole 2GB.

For a CSV import specifically, the flow looks like:

1. Open a **read stream** on the file (`fs.createReadStream()`) instead of reading it all at once.
2. Pipe that stream into a **CSV parser** that supports streaming (like `csv-parser` or `papaparse` in streaming mode, or `fast-csv`) — this parses row by row instead of parsing the whole file as one string.
3. For each row that comes out, do your processing (insert into DB, transform it, whatever) immediately, then move on. Don't collect all rows into one big array — that recreates the same memory problem in a different spot.
4. If you're inserting into a database, batch it (like insert every 500-1000 rows) instead of one row at a time (too slow) or all rows at once (back to the memory problem).

Quick example with `csv-parser`:

```js
const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('big-file.csv')
  .pipe(csv())
  .on('data', (row) => {
    // handle one row here — insert into DB, etc.
  })
  .on('end', () => {
    console.log('done, and memory never spiked');
  });
```

Notice there's no `readFileSync`, no giant array holding all the rows — each row gets handled and thrown away before the next one shows up. That's the whole trick. If you also need backpressure control (so you don't get too far ahead if your DB insert is slow), you'd pause/resume the stream or use something like a queue, but the basic chunk-by-chunk idea above is the main thing that fixes your crash.
