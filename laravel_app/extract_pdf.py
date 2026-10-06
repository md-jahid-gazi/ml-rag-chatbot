import sys
from pathlib import Path

def extract_pdf_text(pdf_path: str) -> str:
    path_obj = Path(pdf_path)
    if not path_obj.exists() or path_obj.stat().st_size == 0:
        return ""

    # Strategy 1: pypdf (fast, robust pure-python reader)
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path_obj))
        text_parts = []
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(f"--- [Page {idx + 1}] ---\n{page_text.strip()}")
        if text_parts:
            return "\n\n".join(text_parts)
    except Exception:
        pass

    # Strategy 2: pymupdf (fitz)
    try:
        import pymupdf
        doc = pymupdf.open(str(path_obj))
        text_parts = []
        for idx, page in enumerate(doc):
            page_text = page.get_text() or ""
            if page_text.strip():
                text_parts.append(f"--- [Page {idx + 1}] ---\n{page_text.strip()}")
        if text_parts:
            return "\n\n".join(text_parts)
    except Exception:
        pass

    # Strategy 3: pdfplumber fallback
    try:
        import pdfplumber
        with pdfplumber.open(str(path_obj)) as pdf:
            text_parts = []
            for idx, page in enumerate(pdf.pages):
                txt = page.extract_text() or ""
                if txt.strip():
                    text_parts.append(f"--- [Page {idx + 1}] ---\n{txt.strip()}")
            if text_parts:
                return "\n\n".join(text_parts)
    except Exception:
        pass

    return ""

if __name__ == '__main__':
    if len(sys.argv) > 1:
        pdf_file = sys.argv[1]
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
        result = extract_pdf_text(pdf_file)
        sys.stdout.write(result)
