import urllib.request
import json
import os
import time

HOMBRES_DIR = os.path.join(os.path.dirname(__file__), "Hombres")
MUJERES_DIR = os.path.join(os.path.dirname(__file__), "Mujeres")
os.makedirs(HOMBRES_DIR, exist_ok=True)
os.makedirs(MUJERES_DIR, exist_ok=True)

def descargar_perfiles(genero, carpeta, cantidad=50):
    print(f"Descargando {cantidad} perfiles de {genero}...")
    url = f"https://randomuser.me/api/?results={cantidad}&gender={genero}&inc=picture"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for i, result in enumerate(data['results']):
            img_url = result['picture']['large']
            img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(img_req) as img_resp:
                filepath = os.path.join(carpeta, f"perfil_{i+1}.jpg")
                with open(filepath, 'wb') as f:
                    f.write(img_resp.read())
            time.sleep(0.1)

descargar_perfiles('male', HOMBRES_DIR, 50)
descargar_perfiles('female', MUJERES_DIR, 50)
print(f"Descarga completa. {len(os.listdir(HOMBRES_DIR))} hombres, {len(os.listdir(MUJERES_DIR))} mujeres.")
