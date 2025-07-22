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
    url: str
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
    
    return "https://www.mercadolibre.com.ar"

def get_v6_cars(query, dollar_rate):
    """
    Función mejorada para obtener autos de V6 usando su API oficial
    """
    print("Procesando V6 usando API oficial...")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Origin": "https://v6.com.ar",
        "Referer": "https://v6.com.ar/"
    }
    
    v6_cars = []
    
    try:
        response = requests.get(
            "https://autoprecios-api.onrender.com/api/db/getPublishedCars", 
            headers=headers, 
            timeout=15
        )
        
        if response.status_code != 200:
            print(f"Error en V6 API: status {response.status_code}")
            return v6_cars
        
        cars_data = response.json()
        
        # Filtrar autos que coincidan con la query
        query_terms = query.lower().split()
        
        for car in cars_data:
            # Crear título completo para buscar
            full_title = f"{car.get('brand', '')} {car.get('model', '')} {car.get('version', '')}".lower()
            
            # Verificar si algún término de búsqueda está en el título
            query_clean = query.lower().strip()
            full_title = f"{car.get('brand', '')} {car.get('model', '')} {car.get('version', '')}".lower()

            if query_clean in full_title:
                try:
                    # Construir título legible
                    title = f"{car.get('brand', '').title()} {car.get('model', '').title()}"
                    if car.get('version'):
                        title += f" {car.get('version')}"
                    if car.get('year'):
                        title += f" {car.get('year')}"
                    
                    # Precio (parece que está en centavos o formato especial)
                    price_raw = car.get('price', 0)
                    if isinstance(price_raw, str):
                        price_raw = int(re.sub(r'[^\d]', '', price_raw))
                    
                    # Si el precio es muy alto, probablemente esté en centavos
                    if price_raw > 1000000:  # Más de 1M, probablemente centavos
                        price_in_pesos = price_raw
                        price_usd = int(price_raw / dollar_rate) if price_raw > 0 else 0
                    else:  # Probablemente ya en USD
                        price_usd = price_raw
                        price_in_pesos = int(price_raw * dollar_rate) if price_raw > 0 else 0
                    
                    # Kilómetros
                    km = None
                    km_raw = car.get('kilometers')
                    if km_raw:
                        try:
                            km = int(re.sub(r'[^\d]', '', str(km_raw)))
                        except:
                            pass
                    
                    # Año
                    year = None
                    year_raw = car.get('year')
                    if year_raw:
                        try:
                            year = int(year_raw)
                        except:
                            pass
                    
                    # Ubicación
                    location = car.get('city', '')
                    if car.get('province') and location:
                        location += f", {car.get('province')}"
                    elif car.get('province'):
                        location = car.get('province')
                    
                    # Imagen
                    image = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png"
                    if car.get('cover') and car['cover'].get('url'):
                        image = car['cover']['url']
                    elif car.get('exterior') and len(car['exterior']) > 0:
                        image = car['exterior'][0].get('url', image)
                    
                    # URL
                    car_id = car.get('carId') or car.get('id', '')
                    url = f"https://v6.com.ar/car/{car_id}" if car_id else "https://v6.com.ar"
                    
                    v6_car = {
                        "id": len(v6_cars) + 1000,  # Offset para evitar conflictos
                        "title": title.strip(),
                        "price": price_in_pesos,
                        "priceUSD": price_usd,
                        "year": year,
                        "km": km,
                        "location": location or "Argentina",
                        "image": image,
                        "url": url,
                        "priceScore": "regular",
                        "publishDate": "desconocido",
                        "source": "v6"  # ← AGREGAR ESTE CAMPO
                    }
                    
                    v6_cars.append(v6_car)
                    print(f"✅ Auto V6 agregado: {title} - ${price_usd}")
                    
                except Exception as e:
                    print(f"⚠️ Error procesando auto V6: {e}")
                    continue
        
        print(f"📊 V6: {len(v6_cars)} autos encontrados")
        
    except Exception as e:
        print(f"❌ Error conectando con V6 API: {e}")
    
    return v6_cars

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
def get_cars(query: str = Query(...), pages: int = 3, include_kavak: bool = False, include_ml: bool = True, include_v6: bool = False):
    # Crear search_query solo para MercadoLibre
    ml_search_query = "-".join(query.strip().split())
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    }

    dollar_rate = get_dollar_rate()
    all_cars = []
    
    print(f"Buscando: {query}")
    print(f"Include ML: {include_ml}, Include Kavak: {include_kavak}, Include V6: {include_v6}")

    # V6 - NUEVA IMPLEMENTACIÓN CON API
    if include_v6:
        v6_cars = get_v6_cars(query, dollar_rate)
        all_cars.extend(v6_cars)

    # MERCADOLIBRE
    if include_ml:
        print("Procesando MercadoLibre...")
        for page in range(pages):
            offset = page * 48
            url = f"https://listado.mercadolibre.com.ar/{ml_search_query}_Desde_{offset}"
            print(f"URL ML: {url}")

            try:
                r = requests.get(url, headers=headers, timeout=10)
                if r.status_code != 200:
                    print(f"Error en página {page}: status {r.status_code}")
                    continue

                soup = BeautifulSoup(r.text, 'html.parser')
                items = soup.find_all('li', class_='ui-search-layout__item')
                print(f"Encontrados {len(items)} items en página {page}")

                for i, item in enumerate(items):
                    try:
                        # Título
                        img_tag = item.find('img')
                        title = img_tag['alt'] if img_tag and 'alt' in img_tag.attrs else 'N/A'

                        # Imagen
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

                        # Precio
                        price_container = item.find('span', class_='andes-money-amount')
                        original_price, is_usd = parse_price_and_currency(price_container)

                        if is_usd:
                            price_in_pesos = int(original_price * dollar_rate)
                            price_usd = original_price
                        else:
                            price_in_pesos = original_price
                            price_usd = int(original_price / dollar_rate) if original_price > 0 else 0

                        # Detalles y URL
                        car_details = extract_car_details(item)
                        car_url = extract_car_url(item)

                        car = {
                            "id": len(all_cars) + 1,
                            "title": title,
                            "price": price_in_pesos,
                            "priceUSD": price_usd,
                            "year": car_details["year"],
                            "km": car_details["km"],
                            "location": car_details["location"],
                            "image": image,
                            "url": car_url,
                            "priceScore": "regular",
                            "publishDate": car_details["publishDate"] or "desconocido",
                            "source": "mercadolibre"  # ← AGREGAR ESTE CAMPO
                        }
                        all_cars.append(car)
                        
                    except Exception as e:
                        print(f"Error procesando item {i} de ML: {e}")
                        continue
                        
            except Exception as e:
                print(f"Error en página {page} de ML: {e}")
                continue

    # KAVAK (solo si se solicita explícitamente)
    if include_kavak:
        print("Procesando Kavak...")
        kavak_query = query.strip().lower().replace(" ", "-")
        kavak_url = f"https://www.kavak.com/ar/usados/{kavak_query}"
        print(f"URL Kavak: {kavak_url}")
        try:
            r = requests.get(kavak_url, headers=headers, timeout=10)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, 'html.parser')
                cards = soup.find_all("a", class_=re.compile("card-product_cardProduct__"))
                print(f"Encontradas {len(cards)} cards en Kavak")
                for card in cards:
                    try:
                        title_elem = card.find("h3", class_=re.compile("card-product_cardProduct__title"))
                        if not title_elem:
                            continue  # no es una card válida
                        title = title_elem.text.strip()
                        # Precio
                        price_elem = card.find("span", class_=re.compile("amount_uki-amount__large__price"))
                        price = int(price_elem.text.strip().replace(".", "").replace("$", "")) if price_elem else 0
                        if price == 0:
                            continue
                        # Año y KM
                        subtitle = card.find("p", class_=re.compile("card-product_cardProduct__subtitle"))
                        year, km = None, None
                        if subtitle:
                            text = subtitle.text
                            year_match = re.search(r"(20\d{2}|19\d{2})", text)
                            km_match = re.search(r"(\d{1,3}(?:\.\d{3})*)\s*km", text.lower())
                            if year_match:
                                year = int(year_match.group())
                            if km_match:
                                km = int(km_match.group(1).replace(".", ""))
                        # Imagen
                        image_tag = card.find("img")
                        image = image_tag["src"] if image_tag and "src" in image_tag.attrs else ""
                        # URL + ID
                        url_base = card["href"]
                        testid = card.get("data-testid", "")
                        match = re.search(r'card-product-(\d+)', testid)
                        car_id = match.group(1) if match else None
                        url = f"{url_base}?id={car_id}" if car_id else url_base
                        car = {
                            "id": len(all_cars) + 1,
                            "title": title,
                            "price": price,
                            "priceUSD": int(price / dollar_rate) if price > 0 else 0,
                            "year": year,
                            "km": km,
                            "location": "Buenos Aires",
                            "image": image,
                            "url": url,
                            "priceScore": "regular",
                            "publishDate": "desconocido",
                            "source": "kavak"  # ← AGREGAR ESTE CAMPO
                        }
                        all_cars.append(car)
                    except Exception as e:
                        print(f"Error procesando card de Kavak: {e}")
            else:
                print(f"Error en Kavak: status {r.status_code}")
        except Exception as e:
            print(f"Error conectando con Kavak: {e}")

    print(f"Total autos encontrados: {len(all_cars)}")

    # Agrupación por km para priceScore
    cluster_prices = defaultdict(list)
    for car in all_cars:
        cluster = get_km_cluster(car["km"])
        cluster_prices[cluster].append(car["price"])

    cluster_avg = {}
    for cluster, prices in cluster_prices.items():
        if prices:
            cluster_avg[cluster] = sum(prices) / len(prices)

    for car in all_cars:
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

    return all_cars

@app.get("/api/dollar-rate")
def get_current_dollar_rate():
    rate = get_dollar_rate()
    return {"dollar_rate": rate}

@app.get("/api/debug-v6")
def debug_v6_api(query: str = Query(...)):
    """
    Endpoint de debug para probar la nueva API de V6
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Origin": "https://v6.com.ar",
        "Referer": "https://v6.com.ar/"
    }
    
    try:
        response = requests.get(
            "https://autoprecios-api.onrender.com/api/db/getPublishedCars", 
            headers=headers, 
            timeout=15
        )
        
        if response.status_code != 200:
            return {"error": f"Status code: {response.status_code}"}
        
        cars_data = response.json()
        
        # Filtrar por query
        query_terms = query.lower().split()
        filtered_cars = []
        
        for car in cars_data[:10]:  # Solo los primeros 10 para debug
            full_title = f"{car.get('brand', '')} {car.get('model', '')} {car.get('version', '')}".lower()
            
            if any(term in full_title for term in query_terms):
                filtered_cars.append({
                    "id": car.get('id'),
                    "brand": car.get('brand'),
                    "model": car.get('model'),
                    "version": car.get('version'),
                    "year": car.get('year'),
                    "price": car.get('price'),
                    "kilometers": car.get('kilometers'),
                    "city": car.get('city'),
                    "province": car.get('province'),
                    "cover_url": car.get('cover', {}).get('url', '')
                })
        
        return {
            "total_cars": len(cars_data),
            "filtered_count": len(filtered_cars),
            "query": query,
            "sample_results": filtered_cars
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/debug-html")
def debug_html_structure(query: str = Query(...)):
    search_query = "-".join(query.strip().split())
    url = f"https://listado.mercadolibre.com.ar/{search_query}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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