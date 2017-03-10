# NASA CMR Rescue

## Method
  1. Parse out links
  1. Sort links to remove duplicates
  1. Trace and sort out direct data links
  1. Go through collections.json again
    1. Match links
    1. Consolidate metadata

## TODO
 - `trace-sorted-links.js`
    - reject only ftp:// links that end in /
 - ftp crawling
 - directory website identification
    - example :http://acdisc.gesdisc.eosdis.nasa.gov/data/Aura_MLS_Level2/ML2HCL.003/
 - directory website crawling

## Collections.json
- 32,710 entries
- 48,125 links
- example entry format:
```json
{
  "boxes": [
    "49.337 -123.45 49.426 -123.325"
  ],
  "time_start": "1970-01-01T00:00:00.000Z",
  "dif_ids": [
    "Canada_SCI_BowenIsGeoLibrary"
  ],
  "version_id": "Not provided",
  "dataset_id": "(SCI) The Bowen Island GeoLibrary (Data Collection)",
  "data_center": "SCIOPS",
  "short_name": "Canada_SCI_BowenIsGeoLibrary",
  "organizations": [
    "BIFWMS"
  ],
  "title": "(SCI) The Bowen Island GeoLibrary (Data Collection)",
  "coordinate_system": "CARTESIAN",
  "summary": "The Bowen Island GeoLibrary is a collection of map, text and image-based...",
  "orbit_parameters": {},
  "id": "C1214621811-SCIOPS",
  "original_format": "DIF",
  "archive_center": "BIFWMS",
  "browse_flag": false,
  "online_access_flag": false,
  "links": [
    {
      "rel": "http://esipfed.org/ns/fedsearch/1.1/metadata#",
      "hreflang": "en-US",
      "href": "http://www.nrcan.gc.ca/earth-sciences/geomatics/canadas-spatial-data-infrastructure/10783"
    }
  ]
}
```

## File descriptions
- `get-collections.js` - gets all metadata from collections, colates all pages as if it were all one page
- `collections.json` - the result of `get-collections.js`
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
