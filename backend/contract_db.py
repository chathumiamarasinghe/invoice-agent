# backend/contract_db.py — updated version
import sqlite3, json

def setup_contracts():
    with open("contracts.json") as f:
        contracts = json.load(f)

    conn = sqlite3.connect("invoices.db")
    conn.execute("""CREATE TABLE IF NOT EXISTS contracts (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_name TEXT UNIQUE,
        data        TEXT
    )""")
    for c in contracts:
        conn.execute(
            "INSERT OR REPLACE INTO contracts "
            "(vendor_name, data) VALUES (?, ?)",
            (c["vendor_name"], json.dumps(c))
        )
    conn.commit()
    conn.close()
    print(f"Loaded {len(contracts)} contracts from contracts.json")

def get_contract(vendor_name: str) -> dict:
    conn = sqlite3.connect("invoices.db")
    # Exact match
    row = conn.execute(
        "SELECT data FROM contracts WHERE vendor_name=?",
        (vendor_name,)).fetchone()
    if not row:
        # Fuzzy match — first 12 chars
        row = conn.execute(
            "SELECT data FROM contracts WHERE "
            "LOWER(vendor_name) LIKE ?",
            (f"%{vendor_name.lower()[:12]}%",)).fetchone()
    conn.close()
    return json.loads(row[0]) if row else None

if __name__ == "__main__":
    setup_contracts()