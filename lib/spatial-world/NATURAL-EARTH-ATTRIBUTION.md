# Natural Earth geographic data

The Spatial World Intelligence globe uses locally bundled vector data from **Natural Earth**
(110m cultural vectors, public domain).

| File | Source |
|------|--------|
| `data/ne_110m_land.json` | [Natural Earth 110m Land](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-land/) |
| `data/ne_110m_coastline.json` | [Natural Earth 110m Coastline](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-coastline/) |

**License:** Natural Earth data is free for use in any project. See
[Natural Earth Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/).

No runtime third-party map tile or geometry servers are used. Geography is rendered from these
bundled files in the client at load time.
