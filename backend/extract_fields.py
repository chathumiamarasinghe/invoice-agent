# # extract_fields.py

# import anthropic, json
# from dotenv import load_dotenv
# from read_pdf import read_pdf
# load_dotenv()

# client = anthropic.Anthropic()

# def extract_invoice_fields(raw_text: str) -> dict:
#     response = client.messages.create(
#         model="claude-sonnet-4-20250514",
#         max_tokens=1000,
#         system="""You are an AP invoice data extractor.
# Read the invoice text and return ONLY this JSON, nothing else:
# {
#   "vendor_name": "",
#   "invoice_number": "",
#   "invoice_date": "MM/DD/YYYY",
#   "po_number": "",
#   "customer_id": "",
#   "line_items": [
#     {
#       "code": "",
#       "description": "",
#       "quantity": 0,
#       "unit_price": 0.00,
#       "amount": 0.00,
#       "category": ""
#     }
#   ],
#   "subtotal": 0.00,
#   "freight": 0.00,
#   "tax": 0.00,
#   "total": 0.00,
#   "currency": "USD",
#   "is_paid": false,
#   "payment_method": ""
# }
# Rules:
# - Date format must be MM/DD/YYYY
# - Currency is always USD
# - PO number starts with 111
# - If the word PAID appears, set is_paid to true
# - For line item category: if it contains
#   shipping/freight/handling/fedex → "freight_tab"
#   surcharge/restocking/processing fee → "dropship_fee"
#   tariff/customs → "gl_5610_21_00"
#   otherwise → "line_item"
# - Return ONLY the JSON object, no other text""",
#         messages=[{
#             "role": "user",
#             "content": f"Extract invoice fields:\n\n{raw_text}"
#         }]
#     )
#     return json.loads(response.content[0].text.strip())

# # Test with Wagler invoice:
# if __name__ == "__main__":
#     text = read_pdf("wagler_invoice.pdf")
#     fields = extract_invoice_fields(text)
#     print(json.dumps(fields, indent=2))

# extract_fields.py

from groq import Groq
import json
from dotenv import load_dotenv
from read_pdf import read_pdf
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def extract_invoice_fields(raw_text: str) -> dict:

    prompt = f"""
You are an AP invoice data extractor.

Read the invoice text and return ONLY this JSON:

{{
  "vendor_name": "",
  "invoice_number": "",
  "invoice_date": "MM/DD/YYYY",
  "po_number": "",
  "customer_id": "",
  "line_items": [
    {{
      "code": "",
      "description": "",
      "quantity": 0,
      "unit_price": 0.00,
      "amount": 0.00,
      "category": ""
    }}
  ],
  "subtotal": 0.00,
  "freight": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "currency": "USD",
  "is_paid": false,
  "payment_method": ""
}}

Rules:
- Date format must be MM/DD/YYYY
- Currency is always USD
- PO number starts with 111
- If the word PAID appears, set is_paid to true
- For line item category:
  shipping/freight/handling/fedex → freight_tab
  surcharge/restocking/processing fee → dropship_fee
  tariff/customs → gl_5610_21_00
  otherwise → line_item

Return ONLY valid JSON.

Invoice text:
{raw_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    result = response.choices[0].message.content

    print("RAW RESPONSE:\n", result)

    result = result.replace("```json", "")
    result = result.replace("```", "")
    result = result.strip()

    try:
        return json.loads(result)

    except Exception as e:
        print("JSON ERROR:", e)
        print("MODEL OUTPUT:\n", result)
        return {}

# Test
if __name__ == "__main__":
    text = read_pdf("wagler_invoice.pdf")
    fields = extract_invoice_fields(text)

    print(json.dumps(fields, indent=2))