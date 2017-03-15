# [NASA CMR](https://wiki.earthdata.nasa.gov/display/CMR/CMR+Client+Partner+User+Guide) Rescue

## Method
  1. ~~Download all pages of [source](https://cmr.sit.earthdata.nasa.gov/search/collections.json?pretty=true)~~ [`collections.json`](https://github.com/crhallberg/nasa-cmr-scraper/blob/master/collections.json)
  1. ~~Parse out links~~ [`all-links.txt`](https://github.com/crhallberg/nasa-cmr-scraper/blob/master/all-links.txt)
  1. ~~Sort links to remove duplicates~~ [`sorted-links.txt`](https://github.com/crhallberg/nasa-cmr-scraper/blob/master/sorted-links.txt)
  1. ~~Trace and sort out direct data links~~ [`traced-data-links.json`](https://github.com/crhallberg/nasa-cmr-scraper/blob/master/traced-data-links.json)
  1. Go through collections.json again
      1. Match links
      1. Consolidate metadata

## TODO
 - ftp direct file data
 - ftp folder crawling
 - directory website identification
    - example :http://acdisc.gesdisc.eosdis.nasa.gov/data/Aura_MLS_Level2/ML2HCL.003/
 - directory website crawling

## File descriptions
- `get-collections.js` - gets all metadata from collections, colates all pages as if it were all one page
- `collections.json` - the result of `get-collections.js` (`collections.min.json` is the file before pretty-printing)
- `links-paging.js` - gets all links available from collections.json API source
- `all-links.txt` - the result of `links-paging.js`
- `sort-links.js` - sorts `all_links.txt` and removes duplicates
- `sorted-links.txt` - the result of `sort-links.js`
- `trace-data-links.js` - uses `curl -sIL` to check and save the headers of all the urls in `sorted-links.txt`
  1. rejects invalid urls
  1. rejects 20 second timeouts
  1. rejects ftp:// directory links
- `traced-data-links.json` - result of `trace-sorted-links.js`

## Collections.json
- 32,710 entries
- 48,125 links
- 5,919 [direct data links](https://github.com/crhallberg/nasa-cmr-scraper/blob/master/traced-data-links.json) (approx. 54GB at min)
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
