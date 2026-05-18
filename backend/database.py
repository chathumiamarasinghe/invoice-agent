# database.py
import sqlite3, json
from datetime import datetime

def setup_db():
    conn = sqlite3.connect("invoices.db")
    conn.execute("""CREATE TABLE IF NOT EXISTS invoices (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_name    TEXT,
        invoice_number TEXT,
        po_number      TEXT,
        total          REAL,
        destination    TEXT,
        is_paid        INTEGER,
        full_data      TEXT,
        created_at     TEXT)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS audit_results (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id       INTEGER,
        vendor_name      TEXT,
        verdict          TEXT,
        findings         TEXT,
        estimated_saving REAL,
        summary          TEXT,
        created_at       TEXT)""")
    conn.commit()
    return conn

def is_duplicate(conn, invoice_number, vendor_name):
    c = conn.execute(
        "SELECT COUNT(*) FROM invoices "
        "WHERE invoice_number=? AND vendor_name=?",
        (invoice_number, vendor_name))
    return c.fetchone()[0] > 0

def save_invoice(conn, data, destination):
    if is_duplicate(conn, data["invoice_number"], data["vendor_name"]):
        print(f"DUPLICATE: {data['invoice_number']} — skipped")
        return None
    c = conn.execute(
        "INSERT INTO invoices (vendor_name,invoice_number,"
        "po_number,total,destination,is_paid,full_data,created_at)"
        " VALUES (?,?,?,?,?,?,?,?)",
        (data["vendor_name"], data["invoice_number"],
         data["po_number"], data["total"], destination,
         1 if data.get("is_paid") else 0,
         json.dumps(data), datetime.now().isoformat()))
    conn.commit()
    print(f"Saved: invoice {data['invoice_number']}, DB id {c.lastrowid}")
    return c.lastrowid


def save_audit(conn, invoice_id, audit_result):
    conn.execute(
        "INSERT INTO audit_results "
        "(invoice_id,vendor_name,verdict,findings,"
        "estimated_saving,summary,created_at)"
        " VALUES (?,?,?,?,?,?,?)",
        (invoice_id,
         audit_result.get("vendor"),
         audit_result.get("verdict"),
         json.dumps(audit_result.get("findings",[])),
         audit_result.get("estimated_saving", 0),
         audit_result.get("summary",""),
         datetime.now().isoformat())
    )
    conn.commit()