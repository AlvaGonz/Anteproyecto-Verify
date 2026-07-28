import sys
path = r'src\frontend\web\src\features\documents\components\CertificadoTituloExtractionCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken self-closing tags
broken1 = '<Check className="w-3 h-3</button>'
fixed1 = '<Check className="w-3 h-3"</button>'
broken2 = '<X className="w-3 h-3</button>'
fixed2 = '<X className="w-3 h-3"</button>'

count1 = content.count(broken1)
count2 = content.count(broken2)
print(f'Found {count1} broken Check, {count2} broken X')

content = content.replace(broken1, fixed1)
content = content.replace(broken2, fixed2)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed')
