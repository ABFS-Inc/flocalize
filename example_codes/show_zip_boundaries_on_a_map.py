import geopandas as gpd
import plotly.express as px
import webbrowser
from pathlib import Path

# Load and filter shapefile downloaded from https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2024&layergroup=ZIP+Code+Tabulation+Areas
shp_path = Path(__file__).parent.parent / "assets" / "zipcode_tabulation_areas" / "tl_2024_us_zcta520.shp"
gdf = gpd.read_file(shp_path)
working_zip_codes = [
    '10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008', '10009', '10010',
    '10011', '10012', '10013', '10014', '10015', '10016', '10017', '10018', '10019', '10020',
    '10021', '10022', '10023', '10024', '10025', '10026', '10027', '10028', '10029', '10030',
    '10031', '10032', '10033', '10034', '10035', '10036', '10037', '10038', '10039', '10040',
    '10041', '10043', '10044', '10045', '10055', '10065', '10069', '10075', '10080', '10081',
    '10087', '10095', '10101', '10103', '10104', '10105', '10106', '10107', '10108', '10110',
    '10111', '10112', '10113', '10115', '10116', '10118', '10119', '10120', '10121', '10122',
    '10123', '10124', '10128', '10129', '10131', '10150', '10151', '10152', '10153', '10154',
    '10155', '10156', '10158', '10159', '10162', '10163', '10164', '10165', '10166', '10167',
    '10168', '10169', '10170', '10171', '10172', '10173', '10174', '10175', '10176', '10177',
    '10178', '10179', '10185', '10199', '10249', '10256', '10259', '10261', '10268', '10269',
    '10270', '10271', '10272', '10274', '10275', '10276', '10277', '10278', '10279', '10280',
    '10281', '10282', '10285', '10286'
]
filtered_gdf = gdf[gdf['ZCTA5CE20'].isin(working_zip_codes)].copy()

# Ensure the data is in a web-friendly format (WGS 84)
filtered_gdf = filtered_gdf.to_crs(epsg=4326)

# Create map
# The centroid calculation is done on a dissolved geometry to find the center of the combined area
dissolved_gdf = filtered_gdf.dissolve()

# Project to a suitable CRS (UTM zone 18N for NYC) to get an accurate centroid
projected_crs = "EPSG:32618"
dissolved_gdf_proj = dissolved_gdf.to_crs(projected_crs)
center_point_proj = dissolved_gdf_proj.centroid.iloc[0]

# Convert centroid back to WGS84 for plotting
center_point = gpd.GeoSeries([center_point_proj], crs=projected_crs).to_crs(dissolved_gdf.crs).iloc[0]

fig = px.choropleth_map(
    filtered_gdf,
    geojson=filtered_gdf.geometry,
    locations=filtered_gdf.index,
    color='ZCTA5CE20',
    hover_name="ZCTA5CE20"
)

fig.update_layout(
    map_style="carto-positron",
    map_zoom=12,
    map_center={"lat": center_point.y, "lon": center_point.x},
    margin={"r":0,"t":0,"l":0,"b":0}
)

# Save and open
output_path = Path(__file__).parent.parent / "test_outputs" / "manhattan_zip_boundaries.html"
fig.write_html(output_path)
webbrowser.open(f"file://{output_path.resolve()}")

# This code is tested and working as of 2025-09-09