import re

with open('generador_entidades_gubernamentales.py', 'r', encoding='utf-8') as f:
    content = f.read()

# I will completely rewrite the generate_ps_records and generate_catastro_ps_ipi_records
# Actually, the user wants the DB updated NOW, and the script updated for FUTURE runs.
# Let's fix the script.

new_ps_gen = '''def generate_ps_records(licencias_list, rncs_list):
    import datetime
    start_date = datetime.date(2026, 7, 1)
    departamentos = ["NORTE", "SUR", "ESTE", "OESTE", "DISTRITO NACIONAL"]
    for licencia in licencias_list:
        mived_id = licencia["MivedId"]
        num_permiso = licencia["NumeroPermiso"]
        provincia = licencia["Provincia"]
        municipio = licencia["Municipio"]
        unidades = licencia.get("UnidadesHabitacionales", 0)
        locales = licencia.get("LocalesComerciales", 0)
        rnc = licencia.get("Rnc")
        if not rnc: rnc = random.choice(rncs_list)
        
        letras = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
        nums1 = "".join(random.choices("0123456789", k=2))
        nums2 = "".join(random.choices("0123456789", k=random.choice([2, 3])))
        num_exp = f"{letras} {nums1}{nums2}"
        day_offset = random.randint(0, 183)
        fecha_emision = start_date + datetime.timedelta(days=day_offset)
        tiene_permiso = random.choice(["1", "0"])
        
        lat, lon = None, None
        coord_info = PROVINCIAS_COORDENADAS.get(provincia)
        if coord_info and municipio in coord_info["municipios"]:
            muni_coords = coord_info["municipios"][municipio]
            lat = muni_coords["lat"] + random.uniform(-0.02, 0.02)
            lon = muni_coords["lon"] + random.uniform(-0.02, 0.02)
        else:
            lat = 18.4861 + random.uniform(-0.5, 0.5)
            lon = -69.9312 + random.uniform(-0.5, 0.5)
            
        base_superficie = random.choice(SUPERFICIE_OPTIONS)
        final_superficie = base_superficie * 3.44
        
        yield {
            "id": str(uuid.uuid4()).upper(), "num_permiso": num_permiso,
            "num_exp": num_exp, "fecha": fecha_emision.strftime("%Y-%m-%d"),
            "rnc": rnc, "provincia": provincia, "municipio": municipio,
            "lat": lat, "lon": lon, "superficie": final_superficie,
            "tiene_permiso": tiene_permiso,
            "departamento": random.choice(departamentos),
            "operacion": random.choice(["MENSURA", "DESLINDE", "SUBDIVISION", "REFUNDICION"]),
            "seccion": "SECCION " + str(random.randint(1, 10)),
            "lugar": "LUGAR " + str(random.randint(1, 100)),
            "mived_id": mived_id,
            "unidades": unidades,
            "locales": locales
        }'''

# Replace the existing generate_ps_records
content = re.sub(r'def generate_ps_records\(licencias_list, rncs_list\):.*?yield \{.*?\}', new_ps_gen, content, flags=re.DOTALL)

with open('generador_entidades_gubernamentales.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated python script logic!")
