# NASA CMR Rescue

## Method
  1. Parse out links
  1. Sort links to remove duplicates
  1. Trace and sort out direct data links
  1. Go through collections.json again
    1. Match links
    1. Consolidate metadata

## TODO
 - make full copy of collections.json
 - `trace-sorted-links.js`
    - [ ] reject only ftp:// links that end in /
 - [ ] ftp crawling
 - [ ] directory website identification
    - example :http://acdisc.gesdisc.eosdis.nasa.gov/data/Aura_MLS_Level2/ML2HCL.003/
 - [ ] directory website crawling

## Collections.json
48,125 links

## File descriptions
- `links-paging.js` - gets all links available from collections.json API source
- `all_links.txt` - the result of `links-paging.js`
- `sort-links.js` - sorts `all_links.txt` and removes duplicates
- `sorted-links.txt` - the result of `sort-links.js`
- `trace-sorted-links.js` - uses `curl -sIL` to check the headers of all the urls in `sorted-links.txt`
  1. rejects invalid urls
  1. rejects 10 second timeouts
  1. rejects ftp:// links (needs special processing for directories)
- `traced-data-links.txt` - result of `trace-sorted-links.js`

- `{timestamp}.txt.bak` - backups of `all_links.txt`
