import os
import re

directories = [
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\components\coach\calendar",
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\components\coach\messages",
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\components\coach\settings",
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\app\(coach)\coach\takvim",
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\app\(coach)\coach\mesajlar",
    r"C:\Users\yusuf\Desktop\NextCoach\koc-paneli\src\app\(coach)\coach\ayarlar"
]

replacements = {
    r'bg-\[#1[0-9A-Fa-f]{5}\](/([0-9]{1,2}))?': 'bg-muted/30',
    r'bg-\[#0[E-Fe-f]{5}\](/([0-9]{1,2}))?': 'bg-muted/20',
    r'bg-\[#2A2A2C\]': 'bg-muted',
    r'bg-\[#19191B\]': 'bg-muted/30',
    r'bg-\[#121214\]': 'bg-muted/50',
    r'bg-\[#18181B\]': 'bg-muted/30',
    r'bg-\[#131315\]': 'bg-muted/30',
    r'bg-\[#09090B\]': 'bg-card',
    
    r'border-\[#27272A\](/[0-9]{1,2})?': 'border-border',
    r'border-\[#444933\](/[0-9]{1,2})?': 'border-border/60',
    r'border-\[#2C2C2E\]': 'border-border',
    r'border-\[#1F1F22\]': 'border-border/50',
    
    r'text-\[#E5E1E4\]': 'text-foreground',
    r'text-\[#C4C9AC\](/[0-9]{1,2})?': 'text-muted-foreground',
    r'text-\[#A1A1AA\]': 'text-muted-foreground',
    
    r'bg-\[#ABD600\]': 'bg-primary',
    r'text-\[#ABD600\]': 'text-primary',
    r'border-\[#ABD600\]': 'border-primary',
    
    r'bg-\[#C3F400\]': 'bg-primary',
    r'text-\[#283500\]': 'text-primary-foreground',
    
    r'stroke="?#ABD600"?': 'stroke="var(--primary)"',
    r'fill="?#ABD600"?': 'fill="var(--primary)"',
    r'stopColor="?#ABD600"?': 'stopColor="var(--primary)"',
    
    r'bg-\[#00eefc\]': 'bg-ring',
    r'text-\[#00eefc\]': 'text-ring',
    r'stroke="?#00eefc"?': 'stroke="var(--ring)"',
    r'fill="?#00eefc"?': 'fill="var(--ring)"',
    r'stopColor="?#00eefc"?': 'stopColor="var(--ring)"',
    
    r'stroke="?#ffb4ab"?': 'stroke="var(--destructive)"',
    r'fill="?#ffb4ab"?': 'fill="var(--destructive)"',
    
    r'stroke="?#d2e5f5"?': 'stroke="var(--secondary)"',
    r'fill="?#d2e5f5"?': 'fill="var(--secondary)"',

    r'fill="?#C4C9AC"?': 'fill="var(--muted-foreground)"',
    r'fill="?#E5E1E4"?': 'fill="var(--foreground)"',
    
    r"'#131315'": "'var(--background)'",
    r"'#2C2C2E'": "'var(--border)'",
    r"'#E5E1E4'": "'var(--foreground)'",
    r"'#C4C9AC'": "'var(--muted-foreground)'",
    r"'#ABD600'": "'var(--primary)'",
    r"'#00eefc'": "'var(--ring)'",
    r"'#ffb4ab'": "'var(--destructive)'",
    r"'#d2e5f5'": "'var(--secondary)'",
    
    r'coach-card': 'surface-card',
    
    r'text-\[#C4C9AC\]': 'text-muted-foreground',
    r'bg-\[#121214\]': 'bg-muted/50',
    r'bg-\[#27272A\]': 'bg-border',
    r'bg-white/5': 'bg-muted',
    r'hover:bg-white/10': 'hover:bg-muted/80',
    r'hover:bg-white/5': 'hover:bg-muted/50',
    r'hover:text-\[#ABD600\]': 'hover:text-primary',
    r'hover:bg-\[#ABD600\]/10': 'hover:bg-primary/10',
    r'hover:bg-\[#ABD600\]/20': 'hover:bg-primary/20',
    r'hover:border-\[#ABD600\]/50': 'hover:border-primary/50'
}

for directory in directories:
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
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
