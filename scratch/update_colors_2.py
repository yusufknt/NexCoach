import os
import re

directories = [
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\components\coach\calendar",
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\components\coach\messages",
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\components\coach\settings"
]

replacements = {
    r'bg-\[#353437\]': 'bg-muted',
    r'bg-\[#0E0E10\]/70': 'bg-muted/20',
    r'ring-\[#C3F400\]/30': 'ring-primary/30',
    r"'#C3F400'": "'var(--primary)'",
    r"#444933": "var(--border)",
    r"#201F22": "var(--card)",
    r"#E5E1E4": "var(--foreground)",
    r"#2A2A2C": "var(--muted)",
    r"#ABD600": "var(--primary)",
    r"#C3F400": "var(--primary)",
    r"#283500": "var(--primary-foreground)",
    r"#C4C9AC": "var(--muted-foreground)",
}

for directory in directories:
    if not os.path.exists(directory):
        continue
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                new_content = content
                for pattern, replacement in replacements.items():
                    new_content = re.sub(pattern, replacement, new_content)
                    
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
