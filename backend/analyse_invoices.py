# backend/analyse_invoices.py
import json
from collections import defaultdict

with open("extracted_invoices.json") as f:
    invoices = json.load(f)

# Group by vendor
by_vendor = defaultdict(list)
for inv in invoices:
    if "vendor_name" in inv:
        by_vendor[inv["vendor_name"]].append(inv)

print("=== VENDOR ANALYSIS ===\n")
for vendor, invs in by_vendor.items():
    totals = [i.get("total", 0) for i in invs]
    print(f"Vendor: {vendor}")
    print(f"  Invoices: {len(invs)}")
    print(f"  Totals: {[f'${t:.2f}' for t in totals]}")
    print(f"  Avg total: ${sum(totals)/len(totals):.2f}")

    # Show all unique items across their invoices
    items_seen = {}
    for inv in invs:
        for item in inv.get("line_items", []):
            code = item.get("code", item.get("description","")[:20])
            price = item.get("unit_price", 0)
            if code and price:
                if code not in items_seen:
                    items_seen[code] = []
                items_seen[code].append(price)

    if items_seen:
        print(f"  Items & prices seen:")
        for code, prices in items_seen.items():
            print(f"    {code}: {[f'${p:.2f}' for p in prices]}")
    print()