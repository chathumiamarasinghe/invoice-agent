# read_pdf.py

import pdfplumber

def read_pdf(path: str) -> str:
    """Read text from a digital PDF — free, no API needed."""
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

# Test it:
if __name__ == "__main__":
    text = read_pdf("wagler_invoice.pdf")
    print("=== TEXT FROM WAGLER INVOICE ===")
    print(text)
    print(f"\nTotal characters: {len(text)}")