# route.py

def route_invoice(data: dict, validation: dict) -> dict:
    if not validation["valid"]:
        return {"destination":"human_review",
                "reason": str(validation["errors"])}

    po = str(data.get("po_number",""))
    desc = str(data.get("invoice_type","")).lower()

    if not po:
        return {"destination":"voucher_folder",
                "reason":"No PO number"}
    if "credit memo" in desc or "credit note" in desc:
        return {"destination":"bills_for_kim",
                "reason":"Credit memo"}
    if "statement" in desc:
        return {"destination":"statements_folder",
                "reason":"Vendor statement"}
    if po.startswith("111"):
        return {"destination":"process_to_sage500",
                "reason":"Valid — PO starts with 111"}
    return {"destination":"halley_folder",
            "reason":"Unclear invoice — Halley reviews daily"}

if __name__ == "__main__":
    from extract_fields import extract_invoice_fields
    from read_pdf import read_pdf
    from validate import validate_invoice
    text = read_pdf("wagler_invoice.pdf")
    fields = extract_invoice_fields(text)
    v = validate_invoice(fields)
    r = route_invoice(fields, v)
    print("Destination:", r["destination"])
    print("Reason:", r["reason"])