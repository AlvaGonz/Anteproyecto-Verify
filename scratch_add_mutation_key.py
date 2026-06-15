import os
import re

base_dir = r"C:\Users\Admin\Desktop\Anteproyecto-Verify\src\frontend\web\src\features"
count = 0

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".ts") or file.endswith(".tsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Simple regex: find `export const useX = (...) => useMutation({`
            # and inject `mutationKey: ["x"],`
            def repl(m):
                global count
                func_name = m.group(1)
                inner = m.group(2)
                
                # Check if mutationKey already exists
                if 'mutationKey:' in inner:
                    return m.group(0)
                    
                count += 1
                return f"export const {func_name} = {inner}useMutation({{\n    mutationKey: ['{func_name}'],"

            new_content = re.sub(r"export const (\w+) = (.*?)useMutation\(\{", repl, content, flags=re.DOTALL)
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)

print(f"Modified {count} mutations.")
