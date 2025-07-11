from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import re
from collections import defaultdict
from datetime import datetime, timedelta

app = FastAPI()

# Habilitar CORS para frontend en localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Car(BaseModel):
    title: str
    price: int
    priceUSD: int
    year: int | None = None
    km: int | None = None
    location: str | None = None
    image: str
    url: str  # ← NUEVA PROPIEDAD
    priceScore: str
    publishDate: str | None = None

def get_dollar_rate():
    try:
        response = requests.get("https://api.bluelytics.com.ar/v2/latest", timeout=10)
        response.raise_for_status()
        data = response.json()
        return data["blue"]["value_avg"]
    except Exception as e:
        print(f"Error al obtener cotización del dólar: {e}")
        return 1285.0

def parse_price_and_currency(price_container):
    if not price_container:
        return 0, False

    currency_symbol = price_container.find('span', class_='andes-money-amount__currency-symbol')
    price_fraction = price_container.find('span', class_='andes-money-amount__fraction')

    if not price_fraction:
        return 0, False

    is_usd = False
    if currency_symbol and currency_symbol.text:
        currency_text = currency_symbol.text.strip()
        is_usd = "US" in currency_text or "USD" in currency_text

    try:
        price_text = price_fraction.text.replace('.', '').replace(',', '').strip()
        price = int(price_text)
    except (ValueError, AttributeError):
        price = 0

    return price, is_usd

def extract_car_details(item):
    details = {"km": None, "year": None, "location": None, "publishDate": None}

    # Ubicación
    location_element = item.find('span', class_='poly-component__location')
    if not location_element:
        location_element = item.find('span', class_='ui-search-item__location')
    if location_element:
        details["location"] = location_element.text.strip()

    # Año y km
    attributes_container = item.find('ul', class_='poly-attributes_list')
    if not attributes_container:
        attributes_container = item.find('ul', class_='ui-search-item__attributes')

    if attributes_container:
        li_elements = attributes_container.find_all('li')
        for li in li_elements:
            text = li.text.strip()
            if "km" in text.lower():
                match = re.search(r'(\d{1,3}(?:\.\d{3})*)', text)
                if match:
                    km_str = match.group(1).replace('.', '')
                    try:
                        details["km"] = int(km_str)
                    except:
                        pass
            if re.search(r'(19|20)\d{2}', text):
                year_match = re.search(r'(19|20)\d{2}', text)
                if year_match:
                    year = int(year_match.group())
                    if 1950 <= year <= 2025:
                        details["year"] = year

    # Fecha de publicación
    pub_text = item.find(string=re.compile("Publicado hace"))
    if pub_text:
        dias = re.search(r'(\d+)\s*d[ií]as', pub_text.lower())
        if dias:
            days_ago = int(dias.group(1))
            publish_date = datetime.today() - timedelta(days=days_ago)
            details["publishDate"] = publish_date.strftime('%Y-%m-%d')

    return details

def extract_car_url(item):
    """
    Extrae la URL de la publicación del auto
    """
    link_element = item.find('a', href=True)

    if link_element:
        href = link_element['href']
        if href.startswith('/'):
            return 'https://www.mercadolibre.com.ar' + href
        return href
    
    return "https://www.mercadolibre.com.ar"  # fallback
  # URL por defecto

def get_km_cluster(km):
    if km is None:
        return "desconocido"
    if km < 70000:
        return "0-70k"
    elif km < 140000:
        return "70k-140k"
    elif km < 200000:
        return "140k-200k"
    else:
        return "+200k"

@app.get("/api/cars")
def get_cars(query: str = Query(...), pages: int = 3):
    search_query = "-".join(query.strip().split())
    headers = {
        "User-Agent": "Mozilla/5.0",
    }

    dollar_rate = get_dollar_rate()
    cars = []

    for page in range(pages):
        offset = page * 48
        url = f"https://listado.mercadolibre.com.ar/{search_query}_Desde_{offset}"

        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            continue  # saltar esta página

        soup = BeautifulSoup(r.text, 'html.parser')
        items = soup.find_all('li', class_='ui-search-layout__item')

        for i, item in enumerate(items):
            img_tag = item.find('img')
            title = img_tag['alt'] if img_tag and 'alt' in img_tag.attrs else 'N/A'

            image = "N/A"
            if img_tag:
                if 'src' in img_tag.attrs and not img_tag['src'].startswith('data:image'):
                    image = img_tag['src']
                elif 'data-src' in img_tag.attrs:
                    image = img_tag['data-src']
                elif 'data-srcset' in img_tag.attrs:
                    srcset_parts = img_tag['data-srcset'].split(',')
                    if srcset_parts:
                        image = srcset_parts[-1].split()[0]
            if image.startswith('data:image') or image == "N/A":
                image = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png"

            price_container = item.find('span', class_='andes-money-amount')
            original_price, is_usd = parse_price_and_currency(price_container)

            if is_usd:
                price_in_pesos = int(original_price * dollar_rate)
                price_usd = original_price
            else:
                price_in_pesos = original_price
                price_usd = int(original_price / dollar_rate) if original_price > 0 else 0

            car_details = extract_car_details(item)
            car_url = extract_car_url(item)

            car = {
                "id": len(cars) + 1,
                "title": title,
                "price": price_in_pesos,
                "priceUSD": price_usd,
                "year": car_details["year"],
                "km": car_details["km"],
                "location": car_details["location"],
                "image": image,
                "url": car_url,
                "priceScore": "regular",
                "publishDate": car_details["publishDate"] or "desconocido"
            }
            cars.append(car)

    # Agrupación por km
    cluster_prices = defaultdict(list)
    for car in cars:
        cluster = get_km_cluster(car["km"])
        cluster_prices[cluster].append(car["price"])

    cluster_avg = {}
    for cluster, prices in cluster_prices.items():
        if prices:
            cluster_avg[cluster] = sum(prices) / len(prices)

    for car in cars:
        cluster = get_km_cluster(car["km"])
        avg_price = cluster_avg.get(cluster)
        p = car["price"]

        if not avg_price:
            score = "regular"
        elif p < avg_price * 0.9:
            score = "muy-bueno"
        elif p < avg_price * 0.97:
            score = "bueno"
        elif p < avg_price * 1.03:
            score = "regular"
        elif p < avg_price * 1.1:
            score = "malo"
        else:
            score = "muy-malo"

        car["priceScore"] = score

    return cars


@app.get("/api/dollar-rate")
def get_current_dollar_rate():
    rate = get_dollar_rate()
    return {"dollar_rate": rate}

@app.get("/api/debug-html")
def debug_html_structure(query: str = Query(...)):
    search_query = "-".join(query.strip().split())
    url = f"https://listado.mercadolibre.com.ar/{search_query}"

    headers = {
        "User-Agent": "Mozilla/5.0",
    }

    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return {"error": f"Status code: {r.status_code}"}

    soup = BeautifulSoup(r.text, 'html.parser')
    items = soup.find_all('li', class_='ui-search-layout__item')
    
    debug_info = []
    
    for i, item in enumerate(items[:3]):
        title_element = item.find('h2', class_='ui-search-item__title')
        if not title_element:
            title_element = item.find('h3', class_='poly-component__title-wrapper')
        
        location_element = item.find('span', class_='poly-component__location')
        if not location_element:
            location_element = item.find('span', class_='ui-search-item__location')
        
        attributes_container = item.find('ul', class_='poly-component__attributes-list')
        if not attributes_container:
            attributes_container = item.find('ul', class_='ui-search-item__attributes')
        
        # Debug de URLs también
        url_element = item.find('a', class_='ui-search-link')
        if not url_element:
            url_element = item.find('a', href=re.compile(r'/[A-Z]{3}\d+'))
        
        item_debug = {
            "index": i,
            "title": title_element.text.strip() if title_element else "No title found",
            "location": location_element.text.strip() if location_element else "No location found",
            "url": url_element['href'] if url_element else "No URL found",
            "url_html": str(url_element) if url_element else "No URL element",
            "attributes": [],
            "location_html": str(location_element) if location_element else "No location element",
            "attributes_html": str(attributes_container) if attributes_container else "No attributes container"
        }
        
        if attributes_container:
            attributes = attributes_container.find_all('li')
            for attr in attributes:
                item_debug["attributes"].append(attr.text.strip())
        
        debug_info.append(item_debug)
    
    return {"debug_info": debug_info, "url": url}