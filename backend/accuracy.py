
# accuracy.py

# "Human entry" — what Kumuda would have typed into Sage 500
HUMAN_ENTRIES = {
    "24073": {
        "vendor_name": "Wagler Competition Products",
        "invoice_number": "24073",
        "invoice_date": "5/8/2026",
        "po_number": "1110540641",
        "subtotal": 777.44,
        "freight": 27.23,
        "total": 804.67,
        "is_paid": True
    }
}

def compare_accuracy(ai_result: dict,
                     human_entry: dict) -> dict:
    fields = ["vendor_name","invoice_number","invoice_date",
              "po_number","subtotal","freight","total"]
    correct, errors = 0, []

    for f in fields:
        ai_val  = str(ai_result.get(f,"")).strip().lower()
        hum_val = str(human_entry.get(f,"")).strip().lower()
        if ai_val == hum_val:
            correct += 1
        else:
            errors.append({
                "field":   f,
                "ai_said": ai_val,
                "human":   hum_val,
                "match":   False
            })

    pct = round((correct / len(fields)) * 100, 1)
    return {
        "total_fields":   len(fields),
        "correct_fields": correct,
        "accuracy_pct":   pct,
        "errors":         errors,
        "grade": ("Excellent" if pct>=97 else
                  "Good"      if pct>=90 else
                  "Needs work")
    }

if __name__ == "__main__":
    from read_pdf import read_pdf
    from extract_fields import extract_invoice_fields
    import json

    # Extract with AI
    text = read_pdf("wagler_invoice.pdf")
    ai   = extract_invoice_fields(text)

    # Compare against human entry
    human  = HUMAN_ENTRIES.get(ai.get("invoice_number",""))
    if human:
        result = compare_accuracy(ai, human)
        print(f"\nAccuracy: {result['accuracy_pct']}%"
              f" ({result['correct_fields']}/{result['total_fields']} fields)")
        print(f"Grade: {result['grade']}")
        if result["errors"]:
            print("\nMismatches:")
            for e in result["errors"]:
                print(f"  {e['field']}: AI={e['ai_said']}"
                      f" | Human={e['human']}")
    else:
        print("No human entry found for this invoice")