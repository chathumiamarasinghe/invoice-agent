# backend/batch_extract.py
import os, json
from read_pdf import read_pdf
from extract_fields import extract_invoice_fields

INVOICE_DIR = "invoices"
OUTPUT_FILE = "extracted_invoices.json"

def batch_extract():
    results = []
    pdfs = [f for f in os.listdir(INVOICE_DIR)
            if f.endswith(".pdf")]

    print(f"Found {len(pdfs)} PDFs")

    for i, filename in enumerate(pdfs, 1):
        path = os.path.join(INVOICE_DIR, filename)
        print(f"\n[{i}/{len(pdfs)}] Processing: {filename}")
        try:
            text   = read_pdf(path)
            fields = extract_invoice_fields(text)
            fields["_source_file"] = filename
            results.append(fields)
            print(f"  ✓ {fields.get('vendor_name','?')} — "
                  f"${fields.get('total',0):.2f}")
        except Exception as e:
            print(f"  ✗ Error: {e}")
            results.append({
                "_source_file": filename,
                "_error": str(e)
            })

    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nDone. Results saved to {OUTPUT_FILE}")
    return results

if __name__ == "__main__":
    data = batch_extract()
    # Print summary
    vendors = set(d.get("vendor_name","?")
                  for d in data if "vendor_name" in d)
    print(f"\nUnique vendors found: {len(vendors)}")
    for v in vendors:
        print(f"  - {v}")