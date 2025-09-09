"""
Manhattan ZIP Code Map with Circles
===================================

This script creates a single interactive visualization showing:
- Map background with Manhattan geography
- Colored circles representing ZIP code target audience density
"""

import pandas as pd
import plotly.express as px
from pathlib import Path
import webbrowser

def create_sample_demographic_data():
    """
    Create sample demographic data for Manhattan ZIP codes
    In practice, this would come from your census analysis
    """
    zip_data = {
        'ZIPCODE': [
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
    ],
        'target_audience_proportion': [0.2303, 0.1435, 0.2148, 0.1863, 0.3197, 0.2702, 0.2219, 0.0, 0.2156, 0.2124,
                                      0.1745, 0.2653, 0.1771, 0.2329, 0.0, 0.2509,
                                      0.2193, 0.2546, 0.1898, 0.0, 0.1797, 0.1642, 0.1517, 0.1625,
                                      0.1725, 0.1918, 0.1857, 0.1824, 0.1910, 0.1769, 0.1900,
                                      0.1773, 0.1524, 0.1701, 0.1512, 0.1858, 0.1740, 0.1959,
                                      0.1328, 0.1439, 0.0, 0.0, 0.1498, 0.0, 0.0, 0.1776, 0.1291, 0.1909, 0.0, 0.0,
                                      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                                      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                                      0.0, 0.0, 0.1833, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                                      0.0, 0.0, 0.0, 0.0, 0.0803, 0.0, 0.0, 0.0, 0.0, 0.0,
                                      0.0, 0.0],
        'latitude': [40.7505, 40.7159, 40.7317, 40.6995, 40.7060, 40.7079, 40.7135,
                    40.7142, 40.7275, 40.7391, 40.7406, 40.7255, 40.7201, 40.7340, 40.7385, 40.7458,
                    40.7520, 40.7550, 40.7654, 40.7589, 40.7685, 40.7580, 40.7759, 40.7865,
                    40.7977, 40.8029, 40.8116, 40.7763, 40.7918, 40.8177, 40.8250,
                    40.8406, 40.8498, 40.8721, 40.8590, 40.7590, 40.8134, 40.7090,
                    40.8272, 40.8583, 40.7051, 40.7063, 40.7614, 40.7075, 40.7619, 40.7642, 40.7749, 40.7723, 40.7105, 40.7117,
                    40.7139, 40.7151, 40.7511, 40.7523, 40.7535, 40.7547, 40.7559, 40.7571, 40.7583, 40.7595,
                    40.7607, 40.7619, 40.7631, 40.7643, 40.7655, 40.7667, 40.7679, 40.7691, 40.7703, 40.7715,
                    40.7727, 40.7739, 40.7813, 40.7825, 40.7837, 40.7512, 40.7524, 40.7536, 40.7548, 40.7560,
                    40.7572, 40.7584, 40.7596, 40.7608, 40.7620, 40.7632, 40.7644, 40.7656, 40.7668, 40.7680,
                    40.7692, 40.7704],
        'longitude': [-73.9934, -73.9865, -73.9892, -74.0405, -74.0086, -74.0132, -74.0055,
                     -74.0061, -73.9797, -73.9826, -73.9996, -73.9997, -74.0048, -74.0050, -74.0039, -73.9757,
                     -73.9725, -73.9942, -73.9805, -73.9772, -73.9588, -73.9654, -73.9822, -73.9701,
                     -73.9683, -73.9504, -73.9465, -73.9523, -73.9448, -73.9428, -73.9475,
                     -73.9410, -73.9357, -73.9025, -73.8972, -73.9847, -73.9496, -74.0026,
                     -73.9362, -73.9035, -74.0108, -74.0096, -73.9648, -74.0087, -73.9637, -73.9625, -73.9513, -73.9535, -74.0119, -74.0107,
                     -74.0095, -74.0083, -73.9911, -73.9899, -73.9887, -73.9875, -73.9863, -73.9851, -73.9839, -73.9827,
                     -73.9815, -73.9803, -73.9791, -73.9779, -73.9767, -73.9755, -73.9743, -73.9731, -73.9719, -73.9707,
                     -73.9695, -73.9683, -73.9489, -73.9477, -73.9465, -73.9912, -73.9900, -73.9888, -73.9876, -73.9864,
                     -73.9852, -73.9840, -73.9828, -73.9816, -73.9804, -73.9792, -73.9780, -73.9768, -73.9756, -73.9744,
                     -73.9732, -73.9720]
    }
    print('Count of data points on each key:')
    for key, value in zip_data.items():
        print(f"  {key}: {len(value)}")

    # Truncate to match lengths
    min_len = min(len(v) for v in zip_data.values())
    for key in zip_data:
        zip_data[key] = zip_data[key][:min_len]

    return pd.DataFrame(zip_data)

def validate_data_lengths():
    """
    Validate that all data arrays have the same length
    """
    zip_data = create_sample_demographic_data()
    lengths = {
        'ZIPCODE': len(zip_data['ZIPCODE']),
        'target_audience_proportion': len(zip_data['target_audience_proportion']),
        'latitude': len(zip_data['latitude']),
        'longitude': len(zip_data['longitude'])
    }

    print("Data array lengths:")
    for key, length in lengths.items():
        print(f"  {key}: {length}")

    all_equal = all(length == lengths['ZIPCODE'] for length in lengths.values())
    if not all_equal:
        print("ERROR: Data arrays have different lengths!")
        return False
    else:
        print("All data arrays have matching lengths.")
        return True

def create_manhattan_visualization():
    """
    Create a single interactive visualization with map background and colored circles
    showing ZIP code target audience density
    """
    print("Creating Manhattan ZIP Code visualization with map and circles...")

    demo_data = create_sample_demographic_data()
    print(f"Loaded data for {len(demo_data)} ZIP codes")

    print("Creating plotly figure...")
    fig = px.scatter_map(
        demo_data,
        lat='latitude',
        lon='longitude',
        size='target_audience_proportion',
        color='target_audience_proportion',
        color_continuous_scale='YlOrRd',
        size_max=30,
        zoom=11,
        center={"lat": 40.7589, "lon": -73.9851},
        title='Manhattan ZIP Code Target Audience Density<br>(Females 20-39 as % of Total Population)',
        labels={'target_audience_proportion': 'Target Audience %'},
        hover_name='ZIPCODE',
        hover_data={'target_audience_proportion': ':.1%',
                   'latitude': ':.4f',
                   'longitude': ':.4f'},
        map_style="carto-positron"
    )

    print("Updating layout...")
    fig.update_layout(
        margin={"r":0,"t":50,"l":0,"b":0},
        coloraxis_colorbar=dict(
            title='Target Audience<br>Proportion',
            tickformat='.1%'
        )
    )

    print("Adding hover template...")
    fig.update_traces(
        hovertemplate='<b>ZIP Code: %{hovertext}</b><br>' +
                     'Target Audience: %{customdata:.1%}<br>' +
                     'Location: (%{lon:.4f}, %{lat:.4f})<br>' +
                     '<extra></extra>'
    )
    
    print("Saving HTML file...")
    output_dir = Path("test_outputs")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "manhattan_zip_visualization.html"

    fig.write_html(output_path)
    print(f"Visualization saved to: {output_path}")

    print("Opening visualization in browser...")
    try:
        webbrowser.open(str(output_path))
        print("Browser opened successfully")
    except Exception as e:
        print(f"Error opening browser: {e}")
        print(f"Please manually open: {output_path}")

    return output_path

if __name__ == "__main__":
    print("Creating Manhattan ZIP Code Visualization...")
    print("Validating data integrity...")

    if not validate_data_lengths():
        print("Data validation failed. Exiting.")
        exit(1)

    create_manhattan_visualization()
    print("Done! The visualization should open in your browser.")
