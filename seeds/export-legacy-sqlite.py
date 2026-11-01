#!/usr/bin/env python3
"""Exporta somente registros editoriais SQLite; nunca consulta a tabela users."""
import json
import sqlite3
import sys
from pathlib import Path

source = Path(__file__).resolve().parents[1] / "data" / "grimorio.sqlite"
if not source.exists():
    print("[]")
    raise SystemExit(0)
uri = source.as_uri() + "?mode=ro"
connection = sqlite3.connect(uri, uri=True)
connection.row_factory = sqlite3.Row
try:
    rows = connection.execute(
        "SELECT id, slug, category, title, summary, body, author, published "
        "FROM records ORDER BY id"
    ).fetchall()
    print(json.dumps([dict(row) for row in rows], ensure_ascii=False))
finally:
    connection.close()
