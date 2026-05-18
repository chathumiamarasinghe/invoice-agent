# pipeline.py
from read_pdf import read_pdf
from extract_fields import extract_invoice_fields
from validate import validate_invoice
from route import route_invoice
from database import setup_db, save_invoice
from audit_agent import audit_invoice
from contract_db import get_contract

def process_invoice(pdf_path: str) -> dict:
    print(f"\n{'='*50}")
    print(f"Processing: {pdf_path}")

    print("Step 1: Reading PDF...")
    text = read_pdf(pdf_path)

    print("Step 2: Extracting fields with AI...")
    fields = extract_invoice_fields(text)

    print("Step 3: Validating...")
    validation = validate_invoice(fields)

    print("Step 4: Routing...")
    routing = route_invoice(fields, validation)

    print("Step 5: Auditing...")
    audit = audit_invoice(fields)

    contract = get_contract(fields.get("vendor_name", ""))
    payment_terms = (contract or {}).get("payment_terms", "Net 30")

    fields["audit"] = audit
    print("Step 6: Saving to database...")
    conn = setup_db()
    invoice_id = save_invoice(conn, fields, routing["destination"])

    result = {
        "status": "success" if invoice_id else "duplicate",
        "invoice_id": invoice_id,
        "vendor": fields.get("vendor_name"),
        "invoice_no": fields.get("invoice_number"),
        "invoice_date": fields.get("invoice_date"),
        "po_number": fields.get("po_number"),
        "total": fields.get("total"),
        "freight": fields.get("freight", 0),
        "subtotal": fields.get("subtotal", 0),
        "payment_terms": payment_terms,
        "is_paid": fields.get("is_paid", False),
        "destination": routing["destination"],
        "valid": validation["valid"],
        "errors": validation["errors"],
        "audit": audit,
    }
    print(f"\nFINAL RESULT:")
    import json
    print(json.dumps(result, indent=2))
    return result

if __name__ == "__main__":
    process_invoice("wagler_invoice.pdf")
