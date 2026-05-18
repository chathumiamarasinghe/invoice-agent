# api_routes.py — JSON endpoints for React frontend
import json
import sqlite3
from collections import defaultdict
from accuracy import compare_accuracy, HUMAN_ENTRIES
from read_pdf import read_pdf
from extract_fields import extract_invoice_fields

DB = "invoices.db"


def _conn():
    return sqlite3.connect(DB)


def get_dashboard_data():
    conn = _conn()
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT vendor_name, total, full_data FROM invoices ORDER BY id DESC"
    ).fetchall()
    conn.close()

    by_vendor = defaultdict(float)
    audits = []
    flagged = 0
    total_saving = 0.0

    for row in rows:
        vendor = row["vendor_name"] or "Unknown"
        by_vendor[vendor] += row["total"] or 0
        try:
            data = json.loads(row["full_data"] or "{}")
        except json.JSONDecodeError:
            data = {}
        audit = data.get("audit") or {}
        if audit.get("verdict") == "flag_for_review":
            flagged += 1
        saving = float(audit.get("estimated_saving") or 0)
        total_saving += saving
        if audit.get("summary"):
            audits.append({
                "vendor": vendor,
                "verdict": audit.get("verdict", "ok"),
                "summary": audit.get("summary", ""),
                "saving": saving,
            })

    return {
        "total": len(rows),
        "flagged": flagged,
        "total_saving": round(total_saving, 2),
        "by_vendor": [
            {"vendor": v, "total": round(t, 2)}
            for v, t in sorted(by_vendor.items(), key=lambda x: -x[1])
        ],
        "audits": audits[:20],
    }


def get_invoices_list():
    conn = _conn()
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT id, vendor_name, invoice_number, po_number, total, "
        "destination, created_at FROM invoices ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_invoice_by_id(invoice_id):
    conn = _conn()
    conn.row_factory = sqlite3.Row
    row = conn.execute(
        "SELECT * FROM invoices WHERE id=?", (invoice_id,)
    ).fetchone()
    conn.close()
    if not row:
        return None
    data = {}
    try:
        data = json.loads(row["full_data"] or "{}")
    except json.JSONDecodeError:
        pass
    contract = None
    try:
        from contract_db import get_contract
        contract = get_contract(row["vendor_name"])
    except Exception:
        pass
    return {
        "id": row["id"],
        "vendor": row["vendor_name"],
        "invoice_no": row["invoice_number"],
        "po_number": row["po_number"],
        "invoice_date": data.get("invoice_date"),
        "total": row["total"],
        "freight": data.get("freight", 0),
        "subtotal": data.get("subtotal", 0),
        "payment_terms": (contract or {}).get("payment_terms", "Net 30"),
        "is_paid": bool(row["is_paid"]),
        "destination": row["destination"],
        "audit": data.get("audit"),
    }


def get_accuracy_data():
    try:
        text = read_pdf("wagler_invoice.pdf")
        ai = extract_invoice_fields(text)
    except Exception:
        ai = {}
    human = HUMAN_ENTRIES.get(str(ai.get("invoice_number", "")))
    if not human:
        return {
            "total_fields": 7,
            "correct_fields": 0,
            "accuracy_pct": 0,
            "errors": [],
            "grade": "No human baseline",
        }
    return compare_accuracy(ai, human)
