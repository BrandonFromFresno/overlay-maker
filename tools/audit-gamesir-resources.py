"""Read a supplied GameSir web ZIP without executing it or changing an installation.
Usage: python tools/audit-gamesir-resources.py archive.zip --output /path/to/audit
Outputs reference metadata only; a model entry does not certify physical support.
"""
import argparse
import collections
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import xml.etree.ElementTree as ET
import zipfile


def decode_js_literal(literal):
    def unescape(match):
        value = match[0][1:]
        if value[0] in "ux":
            return chr(int(value[1:], 16))
        return {"n": "\n", "r": "\r", "t": "\t", "b": "\b", "f": "\f",
                "v": "\v", "0": "\0", "\n": "", "\r\n": ""}.get(value, value)
    return re.sub(r"\\(?:u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r\n|[\s\S])", unescape, literal[1:-1])


def audit(archive_path):
    files = {}
    with zipfile.ZipFile(archive_path) as archive:
        if len(archive.infolist()) > 10000 or sum(i.file_size for i in archive.infolist()) > 512 * 1024 * 1024:
            raise ValueError("Archive exceeds the resource-audit limits")
        for info in archive.infolist():
            name = info.filename.replace("\\", "/")
            if name.startswith("/") or ".." in PurePosixPath(name).parts or re.match(r"^[A-Za-z]:", name):
                raise ValueError("Unsafe archive path")
            if name.endswith("/"):
                continue
            if name in files:
                raise ValueError("Duplicate normalized archive path: " + name)
            files[name] = archive.read(info)
        archive_entries = len(archive.infolist())
    inventory = []
    bundles = []
    theme_modules = {}
    for name, data in sorted(files.items()):
        record = {"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
        if name.lower().endswith(".svg"):
            svg = ET.fromstring(data)
            references = sorted({value for node in svg.iter() for key, value in node.attrib.items()
                                 if key.split("}")[-1] in ["href", "src"] and not value.startswith("#")})
            record.update(viewBox=svg.get("viewBox"), width=svg.get("width"), height=svg.get("height"),
                          tags=dict(collections.Counter(node.tag.split("}")[-1] for node in svg.iter())),
                          embeddedImages=sum(value.startswith("data:") for value in references),
                          externalReferences=[value for value in references if not value.startswith("data:")])
        if name.lower().endswith(".js") and PurePosixPath(name).name.startswith("app."):
            source = data.decode("utf-8")
            modules = []
            for match in re.finditer(r'''JSON\.parse\(("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\)''', source):
                try:
                    value = json.loads(decode_js_literal(match[1]))
                except (ValueError, KeyError):
                    continue
                if isinstance(value, dict) and isinstance(value.get("ByThemes"), dict):
                    modules.append({"characterOffset": match.start(), "ByThemes": value["ByThemes"]})
            registries = []
            for match in re.finditer(r"\b(\w+)=\{(C2:[A-Za-z\w:,]+)\}", source):
                pairs = dict(pair.split(":") for pair in match[2].split(","))
                registries.append({"variable": match[1], "models": pairs, "characterOffset": match.start()})
            theme_keys = sorted({key for module in modules for key in module["ByThemes"]})
            bundles.append({**record, "registries": registries, "themeKeys": theme_keys,
                            "bareThemeAliases": [key for key in theme_keys if "/" not in key],
                            "themeModuleCount": len(modules), "readsGamepadAPI": "getGamepads" in source,
                            "usesWebViewBridge": "chrome.webview" in source,
                            "usesEventSource": "EventSource" in source,
                            "hasSourceMapReference": "sourceMappingURL" in source})
            theme_modules[name] = modules
        inventory.append(record)
    html_files = [name for name in files if name.lower().endswith("index.html")]
    entries = {}
    for name in html_files:
        text = files[name].decode("utf-8")
        entries[name] = {"scripts": re.findall(r'<script[^>]+src="([^"]+)"', text),
                         "styles": re.findall(r'<link[^>]+href="([^"]+\.css)"', text)}
    assets = [record for record in inventory if "/static/devices/" in record["path"]]
    folders = collections.defaultdict(lambda: collections.defaultdict(list))
    for record in assets:
        suffix = record["path"].split("/static/devices/", 1)[1].split("/")
        if len(suffix) >= 3:
            folders[suffix[0]][suffix[1]].append(suffix[-1])
    report = {"archive": {"name": Path(archive_path).name,
                          "sha256": hashlib.sha256(Path(archive_path).read_bytes()).hexdigest(),
                          "entries": archive_entries, "files": len(files),
                          "expandedFileBytes": sum(map(len, files.values()))},
              "entryPoints": entries, "bundles": bundles,
              "assetModels": {model: dict(variants) for model, variants in sorted(folders.items())},
              "inventory": inventory,
              "interpretation": "Resource inventory and declared frontend models; not physical-controller or OBS support certification."}
    return report, theme_modules


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    report, themes = audit(args.archive)
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    for name, value in [("resource-audit.json", report), ("theme-reference.json", themes)]:
        (output / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"files": report["archive"]["files"], "assetModels": len(report["assetModels"]),
                      "assetVariants": sum(map(len, report["assetModels"].values())),
                      "svgFiles": sum(item["path"].endswith(".svg") for item in report["inventory"]),
                      "output": str(output)}))


if __name__ == "__main__":
    main()
