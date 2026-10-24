# India Map Studio

The Dates map uses map-engine.js and assets/maps/india-states.svg from https://github.com/nikhilsawantse/india-map-studio. The engine is retained in src/vendor/india-map-engine.js; the SVG is local in public/india-map-studio. The site's side panels and sample data are not included. Our React wrapper adds pointer pan, wheel and pinch zoom, zoom controls and state focusing.

Code license: india-map-studio-LICENSE.txt. Geographic dataset attribution and upstream MIT notice: india-map-studio-ATTRIBUTION.md and india-map-studio-THIRD_PARTY_NOTICES.md. Only the national state/UT layer is included.

map-projection.json uses the Mercator transformation in tools/generate_maps.py with bounds from the same attributed datta07/INDIAN-SHAPEFILES revision. This aligns the user-supplied memory pins with the national SVG geometry. The temporary source GeoJSON was removed after calculating the transform.
