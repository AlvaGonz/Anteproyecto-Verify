import pymssql
import csv
import os
from datetime import datetime

try:
    conn = pymssql.connect(
        server='localhost',
        port=1433,
        user='sa',
        password='Your_password123',
        database='verifinca-spm-uce-2026'
    )
    cursor = conn.cursor(as_dict=True)
    
    # We want to map back the EstadoId and ProvinciaId if needed, but let's see what is stored in the DB.
    # The columns in the original CSV:
    headers = [
        "IdProyecto", "CodigoInterno", "NombreProyecto", "UbicacionTexto", "UbicacionGps", 
        "ValorEstimado", "DatosDesarrollador", "RncDesarrollador", "Matricula", "CategoriaId", 
        "DesignacionCatastral", "EstadoJuridico", "EstadoIntegridad", "SelladoBloqueado", 
        "IdUsuario", "CreatedAtUtc", "UpdatedAtUtc", "ImagenUrl", "Propietario", 
        "CedulaRncPropietario", "Ipi", "EstatusIpi", "SuperficieM2", 
        "ImagenAdicional1", "ImagenAdicional2", "ImagenAdicional3", "ImagenAdicional4", "ImagenAdicional5", 
        "EstadoId", "ProvinciaId"
    ]
    
    # Let's query
    cursor.execute("""
        SELECT 
            p.IdProyecto, p.CodigoInterno, p.NombreProyecto, p.UbicacionTexto, p.UbicacionGps,
            p.ValorEstimado, p.DatosDesarrollador, p.RncDesarrollador, p.Matricula, p.CategoriaId,
            p.DesignacionCatastral, p.EstadoJuridico, p.EstadoIntegridad, p.SelladoBloqueado,
            p.IdUsuario, p.CreatedAtUtc, p.UpdatedAtUtc, p.ImagenUrl, p.Propietario,
            p.CedulaRncPropietario, p.Ipi, p.EstatusIpi, p.SuperficieM2,
            p.ImagenAdicional1, p.ImagenAdicional2, p.ImagenAdicional3, p.ImagenAdicional4, p.ImagenAdicional5,
            es.CodigoUnico as EstadoCodigo,
            p.EstadoId, p.ProvinciaId
        FROM ProyectosInmobiliarios p
        LEFT JOIN ProyectosEstados es ON p.EstadoId = es.Id
    """)
    
    rows = cursor.fetchall()
    
    # We need to map EstadoCodigo back to the CSV GUIDs:
    # publicado_csv = '8006E230-79A0-40B7-AD3B-B399B564F8F8'
    # revision_csv = '4F756062-8E28-4907-B633-C6285CE2C5E5'
    # editado_csv = '0694D868-A8AE-42FF-8F88-58E75F4034D2'
    # creado_csv = '4793E761-8E4A-4414-B64B-BA71FF57EEB5'
    
    state_to_guid = {
        'PUBLICADO': '8006e230-79a0-40b7-ad3b-b399b564f8f8',
        'REVISION': '4f756062-8e28-4907-b633-c6285ce2c5e5',
        'EDITADO': '0694d868-a8ae-42ff-8f88-58e75f4034d2',
        'CREADO': '4793e761-8e4a-4414-b64b-ba71ff57eeb5'
    }
    
    # Let's map IdUsuario to original CSV user GUIDs if they exist:
    # Actually, the user asked to move them between the DB GUIDs, but wait!
    # If they are exporting to a CSV, the CSV contains the USER IDs from the DB.
    # Wait, the DB GUIDs in the user's DB are:
    # Corporativo: 72B0AB9C-2949-4EC6-8F23-B88AE52E5305
    # Freemium: 326FAF88-E748-4F08-80EC-98BF3A475766
    # Let's export them exactly as they are in the database.
    
    os.makedirs('Bots/ProyectosInmobiliarios', exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"Bots/ProyectosInmobiliarios/ProyectosInmobiliarios_{date_str}.csv"
    
    with open(file_name, 'w', newline='', encoding='utf-8') as f:
        # Write headers
        f.write("|".join(headers) + "\n")
        
        for row in rows:
            # Format dates to match CSV (YYYY-MM-DD HH:MM:SS.ffffff)
            created_at = row['CreatedAtUtc'].strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] if row['CreatedAtUtc'] else ""
            updated_at = row['UpdatedAtUtc'].strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] if row['UpdatedAtUtc'] else ""
            
            # Map EstadoId to original Guid or keep it if it is already a Guid
            estado_code = row['EstadoCodigo']
            estado_guid = state_to_guid.get(str(estado_code).upper(), str(row['EstadoId'] or '').lower())
            
            # Helper to format nulls as empty string
            def fmt(val):
                if val is None:
                    return ""
                if isinstance(val, bool):
                    return str(val)
                return str(val)
            
            line_data = [
                fmt(row['IdProyecto']).lower(),
                fmt(row['CodigoInterno']),
                fmt(row['NombreProyecto']),
                fmt(row['UbicacionTexto']),
                fmt(row['UbicacionGps']),
                f"{row['ValorEstimado']:.2f}" if row['ValorEstimado'] is not None else "",
                fmt(row['DatosDesarrollador']),
                fmt(row['RncDesarrollador']),
                fmt(row['Matricula']),
                fmt(row['CategoriaId']),
                fmt(row['DesignacionCatastral']),
                fmt(row['EstadoJuridico']),
                fmt(row['EstadoIntegridad']),
                fmt(row['SelladoBloqueado']),
                fmt(row['IdUsuario']).lower(),
                created_at,
                updated_at,
                fmt(row['ImagenUrl']),
                fmt(row['Propietario']),
                fmt(row['CedulaRncPropietario']),
                fmt(row['Ipi']),
                fmt(row['EstatusIpi']),
                f"{row['SuperficieM2']:.2f}" if row['SuperficieM2'] is not None else "",
                fmt(row['ImagenAdicional1']),
                fmt(row['ImagenAdicional2']),
                fmt(row['ImagenAdicional3']),
                fmt(row['ImagenAdicional4']),
                fmt(row['ImagenAdicional5']),
                estado_guid,
                fmt(row['ProvinciaId'])
            ]
            
            f.write("|".join(line_data) + "\n")
            
    print(f"SUCCESS: Exported {len(rows)} projects to {file_name}")

except Exception as ex:
    print(f"ERROR: {ex}")
