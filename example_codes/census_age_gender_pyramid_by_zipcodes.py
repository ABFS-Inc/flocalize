import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from census import Census
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional, Union, Tuple

class CensusDemographics:
    age_gender_vars: Dict[str, str] = {
        "B01001_001E": "Total",
        
        "B01001_002E": "Male_Total",
        "B01001_003E": "Male_Under_5",
        "B01001_004E": "Male_5_to_9",
        "B01001_005E": "Male_10_to_14",
        "B01001_006E": "Male_15_to_17",
        "B01001_007E": "Male_18_and_19",
        "B01001_008E": "Male_20",
        "B01001_009E": "Male_21",
        "B01001_010E": "Male_22_to_24",
        "B01001_011E": "Male_25_to_29",
        "B01001_012E": "Male_30_to_34",
        "B01001_013E": "Male_35_to_39",
        "B01001_014E": "Male_40_to_44",
        "B01001_015E": "Male_45_to_49",
        "B01001_016E": "Male_50_to_54",
        "B01001_017E": "Male_55_to_59",
        "B01001_018E": "Male_60_and_61",
        "B01001_019E": "Male_62_to_64",
        "B01001_020E": "Male_65_and_66",
        "B01001_021E": "Male_67_to_69",
        "B01001_022E": "Male_70_to_74",
        "B01001_023E": "Male_75_to_79",
        "B01001_024E": "Male_80_to_84",
        "B01001_025E": "Male_85_and_over",
        
        "B01001_026E": "Female_Total",
        "B01001_027E": "Female_Under_5",
        "B01001_028E": "Female_5_to_9",
        "B01001_029E": "Female_10_to_14",
        "B01001_030E": "Female_15_to_17",
        "B01001_031E": "Female_18_and_19",
        "B01001_032E": "Female_20",
        "B01001_033E": "Female_21",
        "B01001_034E": "Female_22_to_24",
        "B01001_035E": "Female_25_to_29",
        "B01001_036E": "Female_30_to_34",
        "B01001_037E": "Female_35_to_39",
        "B01001_038E": "Female_40_to_44",
        "B01001_039E": "Female_45_to_49",
        "B01001_040E": "Female_50_to_54",
        "B01001_041E": "Female_55_to_59",
        "B01001_042E": "Female_60_and_61",
        "B01001_043E": "Female_62_to_64",
        "B01001_044E": "Female_65_and_66",
        "B01001_045E": "Female_67_to_69",
        "B01001_046E": "Female_70_to_74",
        "B01001_047E": "Female_75_to_79",
        "B01001_048E": "Female_80_to_84",
        "B01001_049E": "Female_85_and_over"
    }

    working_zip_codes: List[str] = [
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
    
    target_columns: List[str] = ["Female_Total"]
    population_column: str = "Male_Total"

    def __init__(self, api_key: str, target_columns: Optional[List[str]] = None, population_column: Optional[str] = None, working_zip_codes: Optional[List[str]] = None):
        self.api_key = api_key
        self.c = Census(api_key)
        self.target_columns = target_columns if target_columns is not None else self.__class__.target_columns
        self.population_column = population_column if population_column is not None else self.__class__.population_column
        self.working_zip_codes = working_zip_codes if working_zip_codes is not None else self.__class__.working_zip_codes

    def fetch_demographic_data_by_zips(self, year: Optional[int] = None) -> pd.DataFrame:
        if year is None:
            year = self.c.acs5.default_year
            print(f"Using latest available ACS 5-year data for year: {year}")
        
        data = self.c.acs5.get(
            list(self.age_gender_vars.keys()),
            {'for': f'zip code tabulation area:{",".join(self.working_zip_codes)}'},
            year=year
        )
        
        df = pd.DataFrame(data)
        return df.rename(columns=self.age_gender_vars)

    def calculate_zip_ratios(self) -> Dict[str, float]:
        df = self.fetch_demographic_data_by_zips()
        zip_ratios = {}
        
        for _, row in df.iterrows():
            zip_code = row["zip code tabulation area"]
            
            if isinstance(self.population_column, list):
                population_value = row[self.population_column].sum()
            else:
                population_value = row[self.population_column]
            
            if population_value > 0:
                target_value = row[self.target_columns].sum()
                ratio = target_value / population_value
                zip_ratios[zip_code] = ratio
            else:
                zip_ratios[zip_code] = 0.0
        
        ranked_ratios = sorted(zip_ratios.items(), key=lambda x: x[1], reverse=True)
        return dict(ranked_ratios)

if __name__ == "__main__":
    # Example usage
    import pprint as p
    try:
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'secrets.env'))
        api_key = os.getenv("CENSUS_API_KEY")
        if not api_key:
            raise ValueError("CENSUS_API_KEY not found in environment variables.")

        analyzer = CensusDemographics(api_key)
        zip_rankings = analyzer.calculate_zip_ratios()
        p.pprint("ZIP Code Ratios:")
        p.pprint(zip_rankings, sort_dicts=False)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    
