# validate.py

def validate_invoice(data: dict) -> dict:
    errors = []

    # Required fields
    for f in ["vendor_name","invoice_number","po_number","total"]:
        if not data.get(f):
            errors.append(f"Missing: {f}")

    # PO starts with 111
    po = str(data.get("po_number",""))
    if po and not po.startswith("111"):
        errors.append(f"PO {po} does not start with 111")

    # Maths: line items → subtotal
    if data.get("line_items") and data.get("subtotal"):
        line_sum = sum(i.get("amount",0) for i in data["line_items"])
        if abs(line_sum - data["subtotal"]) > 0.01:
            errors.append(
                f"Line items ${line_sum:.2f} "
                f"≠ subtotal ${data['subtotal']:.2f}")

    # Maths: subtotal + freight = total
    sub = data.get("subtotal",0) or 0
    freight = data.get("freight",0) or 0
    total = data.get("total",0) or 0
    if total and abs((sub + freight) - total) > 0.01:
        errors.append(
            f"${sub:.2f} + ${freight:.2f} "
            f"= ${sub+freight:.2f} ≠ ${total:.2f}")

    return {"valid": len(errors)==0, "errors": errors}

# Test with Wagler:
if __name__ == "__main__":
    from extract_fields import extract_invoice_fields
    from read_pdf import read_pdf
    fields = extract_invoice_fields(read_pdf("wagler_invoice.pdf"))
    result = validate_invoice(fields)
    print("Valid:", result["valid"])
    if result["errors"]:
        for e in result["errors"]:
            print(" -", e)