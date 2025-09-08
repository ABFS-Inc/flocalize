import os
from census import Census
from dotenv import load_dotenv

def test_census_api():
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'secrets.env'))
    api_key = os.getenv("CENSUS_API_KEY")
    if not api_key:
        raise ValueError("CENSUS_API_KEY not found in environment variables.")

    c = Census(api_key)
    
    try:
        data = c.acs5.get(("NAME", "B01003_001E"), {'for': 'zip code tabulation area:10001'})
        print("API Key is valid!")
        print(f"Data for ZIP 10001: {data}")
    except Exception as e:
        print(f"API Key test failed: {e}")

if __name__ == "__main__":
    test_census_api()
