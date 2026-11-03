import json
import tarfile
import xml.etree.ElementTree as ET
from pathlib import Path

path = Path(__file__).resolve().parent.parent
version = json.loads((path / 'package.json').read_text(encoding='utf-8'))['version']
svg = ET.parse(path / 'icon.svg')
with tarfile.open(path / f'dist/local-dsh-session-sources-{version}.tgz') as archive:
    names = archive.getnames()
    assert not any('.host-api' in name or '.verification' in name for name in names)
    for expected in ['client.js', 'src/server.js', 'src/indexer.js', 'src/client.css', 'locale/zh.json', 'icon.svg', 'docs/acceptance.md', 'tests/server.test.mjs']:
        assert 'package/' + expected in names, expected
    print(f'Verified {len(names)} distributed files; no extracted Host sources or temporary fixtures.')
assert svg.getroot().tag == '{http://www.w3.org/2000/svg}svg'
print('Original SVG is well-formed.')
