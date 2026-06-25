#!/bin/bash
set -e

# Generate static data JSON files before build
node scripts/generate-data-json.js

# Build the Astro project
npx astro build

# Patch the Vercel Build Output config to add API proxy route
# (The @astrojs/vercel adapter overwrites vercel.json rewrites)
python3 << 'PYEOF'
import json

config_path = '.vercel/output/config.json'
with open(config_path) as f:
    config = json.load(f)

# Check if API proxy route already exists
routes = config['routes']
has_api_proxy = any(
    r.get('src') == '^/api/strapi/(.*)$' 
    for r in routes
)

if not has_api_proxy:
    new_route = {
        "src": "^/api/strapi/(.*)$",
        "dest": "http://8.149.139.66:1337/api/$1"
    }
    # Insert before filesystem handler
    fs_idx = next(
        (i for i, r in enumerate(routes) if r.get('handle') == 'filesystem'),
        None
    )
    if fs_idx is not None:
        routes.insert(fs_idx, new_route)
    else:
        routes.append(new_route)
    
    # Also patch runtime to nodejs20.x (since Vercel deprecated nodejs18.x)
    import os
    vc_config_path = '.vercel/output/functions/_render.func/.vc-config.json'
    if os.path.exists(vc_config_path):
        with open(vc_config_path) as f:
            vc_config = json.load(f)
        if vc_config.get('runtime') == 'nodejs18.x':
            vc_config['runtime'] = 'nodejs20.x'
            with open(vc_config_path, 'w') as f:
                json.dump(vc_config, f, indent=2)
            print('Patched runtime: nodejs18.x -> nodejs20.x')
    
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    print('Patched config: added API proxy route')
else:
    print('API proxy route already exists, skipping patch')
PYEOF

echo "Build and patch complete!"
