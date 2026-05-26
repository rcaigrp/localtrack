import os
import json
import re

project_dir = "/workspace/projects/LocalTrack"
files = ["manifest.json", "index.html", "popup.js", "background.js", "styles.css"]
missing = [f for f in files if not os.path.exists(f"{project_dir}/{f}")]
if missing:
    print(f"MISSING FILES: {missing}")
else:
    print("ALL FILES PRESENT")

with open(f"{project_dir}/manifest.json") as f:
    manifest = json.load(f)
perms = manifest.get("permissions", [])
if set(perms) == {"storage", "tabs"}:
    print("MANIFEST PERMISSIONS: CORRECT")
else:
    print(f"MANIFEST PERMISSIONS: INCORRECT ({perms})")

network_patterns = [r'\bfetch\s*\(', r'\bXMLHttpRequest', r'\baxios', r'\b$.get', r'\b$.ajax']
net_found = False
for f in ["popup.js", "background.js"]:
    with open(f"{project_dir}/{f}") as file:
        content = file.read()
        for pat in network_patterns:
            if re.search(pat, content):
                print(f"NETWORK REQUEST FOUND in {f}")
                net_found = True
if not net_found:
    print("NO NETWORK REQUESTS FOUND")
