import re
import sys

def translate_mysql_to_tsql(mysql_content):
    content = "SET QUOTED_IDENTIFIER ON;\nSET ANSI_NULLS ON;\nGO\n" + mysql_content
    
    # 1. Enclose verifinca-spm-uce-2026 with brackets and use standard T-SQL conditional database creation
    # Matches both "CREATE DATABASE [verifinca-spm-uce-2026];" and MySQL-style "CREATE DATABASE IF NOT EXISTS `verifinca-spm-uce-2026`;", as well as any following GO.
    db_create_pattern = r'CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\'\[]?verifinca-spm-uce-2026[`"\'\]]?;(?:\s*\bGO\b)?'
    db_create_replacement = """IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'verifinca-spm-uce-2026')
BEGIN
    CREATE DATABASE [verifinca-spm-uce-2026];
END
GO"""
    content = re.sub(db_create_pattern, db_create_replacement, content, flags=re.IGNORECASE)
    
    # 2. Translate USE statement with brackets and GO separator, absorbing any trailing GO
    use_pattern = r'USE\s+[`"\'\[]?verifinca-spm-uce-2026[`"\'\]]?;(?:\s*\bGO\b)?'
    use_replacement = "USE [verifinca-spm-uce-2026];\nGO"
    content = re.sub(use_pattern, use_replacement, content, flags=re.IGNORECASE)
    
    # 3. Replace AUTO_INCREMENT with IDENTITY(1,1)
    content = re.sub(r'\bAUTO_INCREMENT\b', 'IDENTITY(1,1)', content, flags=re.IGNORECASE)
    
    # 4. Remove COLUMN from ALTER TABLE ADD COLUMN
    content = re.sub(r'\bADD\s+COLUMN\s+', 'ADD ', content, flags=re.IGNORECASE)
    
    # 5. Remove remaining backticks (MySQL-style quotes)
    content = content.replace('`', '')
    
    return content

if __name__ == '__main__':
    input_file = '/usr/config/Build-Database-Sql.sql'
    output_file = '/usr/config/Build-Database-Sql.tsql'
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
        
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            mysql_sql = f.read()
            
        tsql = translate_mysql_to_tsql(mysql_sql)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(tsql)
            
        print(f"Successfully translated {input_file} to {output_file} (MySQL -> T-SQL)")
    except Exception as e:
        print(f"Error during SQL translation: {e}", file=sys.stderr)
        sys.exit(1)
