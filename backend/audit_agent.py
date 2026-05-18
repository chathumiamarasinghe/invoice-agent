
# audit_agent.py
from groq import Groq
from contract_db import get_contract
import json, os
from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def audit_invoice(invoice_data: dict) -> dict:
    """
    Compare extracted invoice data against supplier contract.
    Returns a list of findings — discrepancies, savings, flags.
    """
    vendor = invoice_data.get("vendor_name", "")
    total  = invoice_data.get("total", 0)
    items  = invoice_data.get("line_items", [])

    # 1. Look up the supplier contract
    contract = get_contract(vendor)

    if not contract:
        return {
            "vendor": vendor,
            "contract_found": False,
            "findings": [],
            "estimated_saving": 0,
            "status": "no_contract"
        }

    # 2. Build context for the AI auditor
    context = f"""
Supplier contract for {vendor}:
- Agreed prices: {json.dumps(contract.get('agreed_prices', {}))}
- Volume discount: {contract.get('volume_discount_pct', 0)}% off
  when order total exceeds ${contract.get('volume_threshold', 0)}
- Payment terms: {contract.get('payment_terms', 'Net 30')}

Invoice received:
- Total: ${total}
- Line items: {json.dumps(items, indent=2)}
"""

    # 3. Ask Groq to audit it
    response = client.chat.completions.create(
        model="llama3-8b-8192",   # free Groq model
        messages=[
            {
                "role": "system",
                "content": """You are an AP auditor.
Compare the invoice against the contract and return ONLY JSON:
{
  "findings": [
    {
      "type": "missing_discount|overcharge|wrong_terms|other",
      "description": "plain English explanation",
      "expected": "what it should have been",
      "actual": "what was on the invoice",
      "saving": 0.00
    }
  ],
  "estimated_saving": 0.00,
  "verdict": "ok|flag_for_review",
  "summary": "one sentence plain English summary"
}
Return ONLY the JSON, nothing else."""
            },
            {
                "role": "user",
                "content": f"Audit this invoice:\n{context}"
            }
        ]
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json","").replace("```","").strip()

    try:
        audit = json.loads(raw)
    except:
        audit = {
            "findings": [],
            "estimated_saving": 0,
            "verdict": "ok",
            "summary": "Could not parse audit result"
        }

    audit["vendor"] = vendor
    audit["contract_found"] = True
    audit["total_invoiced"] = total

    return audit


# Test it:
if __name__ == "__main__":
    sample = {
        "vendor_name": "Wagler Competition Products",
        "total": 804.67,
        "line_items": [
            {"description": "WCPC6641 Billet Main Caps",
             "amount": 751.15},
            {"description": "CRECAR Credit Card Fee",
             "amount": 26.29}
        ]
    }
    result = audit_invoice(sample)
    print(json.dumps(result, indent=2))