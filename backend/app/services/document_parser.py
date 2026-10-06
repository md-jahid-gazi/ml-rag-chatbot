import io
import csv
import json
from pathlib import Path
from typing import Dict, Any, Tuple
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader

from backend.app.core.logger import logger

class DocumentParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes, filename: str) -> str:
        """Extract clean, selectable text from PDF pages with multi-library fallback."""
        text_parts = []
        # Strategy 1: PyMuPDF (fitz) - robust layout, ligatures, and font encoding
        try:
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for idx, page in enumerate(doc):
                page_text = page.get_text() or ""
                clean_lines = [l.strip() for l in page_text.split("\n") if l.strip()]
                joined = "\n".join(clean_lines)
                if joined.strip():
                    text_parts.append(f"--- [Page {idx + 1}] ---\n{joined.strip()}")
            if text_parts:
                return "\n\n".join(text_parts)
        except Exception as e:
            logger.warning(f"PyMuPDF parse failed for {filename}, trying pypdf: {e}")

        # Strategy 2: pypdf fallback
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(f"--- [Page {idx + 1}] ---\n{page_text.strip()}")
            if text_parts:
                return "\n\n".join(text_parts)
        except Exception as e:
            logger.warning(f"pypdf parse failed for {filename}, trying pdfplumber: {e}")

        # Strategy 3: pdfplumber fallback
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text_parts = []
                for idx, page in enumerate(pdf.pages):
                    txt = page.extract_text() or ""
                    if txt.strip():
                        text_parts.append(f"--- [Page {idx + 1}] ---\n{txt.strip()}")
                if text_parts:
                    return "\n\n".join(text_parts)
        except Exception as e:
            logger.error(f"All PDF parsers failed for {filename}: {e}")

        raise ValueError(f"Could not extract readable text from PDF {filename}.")

    @staticmethod
    def parse_text(file_bytes: bytes) -> str:
        """Decode plain text or markdown with encoding fallbacks"""
        for encoding in ["utf-8", "latin-1", "cp1252"]:
            try:
                return file_bytes.decode(encoding)
            except UnicodeDecodeError:
                continue
        return file_bytes.decode("utf-8", errors="replace")

    @staticmethod
    def parse_csv(file_bytes: bytes) -> str:
        """Parse CSV rows into readable textual representation"""
        text_content = DocumentParser.parse_text(file_bytes)
        reader = csv.reader(io.StringIO(text_content))
        lines = []
        headers = []
        for i, row in enumerate(reader):
            if i == 0:
                headers = row
            else:
                row_str = ", ".join([f"{headers[j] if j < len(headers) else f'Col{j}'}: {val}" for j, val in enumerate(row)])
                lines.append(f"Row {i}: {row_str}")
        return "\n".join(lines)

    @staticmethod
    def parse_json(file_bytes: bytes) -> str:
        """Parse JSON into formatted text representation"""
        text_content = DocumentParser.parse_text(file_bytes)
        data = json.loads(text_content)
        return json.dumps(data, indent=2)

    @staticmethod
    def scrape_url(url: str) -> Tuple[str, str]:
        """
        Scrape and extract clean text and title from a web page.
        Returns: (title, cleaned_text)
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            resp = requests.get(url, headers=headers, timeout=12)
            resp.raise_for_status()

            soup = BeautifulSoup(resp.text, "html.parser")

            # Remove scripts, styles, forms, navbars, and footers
            for elem in soup(["script", "style", "nav", "footer", "header", "noscript", "aside"]):
                elem.extract()

            title = soup.title.string.strip() if soup.title and soup.title.string else url

            # Gather text from paragraphs and headers
            blocks = []
            for tag in soup.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
                tag_text = tag.get_text(separator=" ", strip=True)
                if len(tag_text) > 25:
                    blocks.append(tag_text)

            body_text = "\n\n".join(blocks)
            if not body_text:
                body_text = soup.get_text(separator="\n", strip=True)

            logger.info(f"Successfully scraped URL: {url} (Extracted {len(body_text)} characters)")
            return title, body_text
        except Exception as e:
            logger.error(f"Failed to scrape URL {url}: {str(e)}")
            raise ValueError(f"Could not scrape URL: {str(e)}")

    @classmethod
    def parse_file(cls, filename: str, content_bytes: bytes) -> Tuple[str, str]:
        """
        Detect format by file extension and extract text.
        Returns: (file_type, text_content)
        """
        ext = Path(filename).suffix.lower()
        if ext == ".pdf":
            return "pdf", cls.parse_pdf(content_bytes, filename)
        elif ext in [".txt", ".text"]:
            return "txt", cls.parse_text(content_bytes)
        elif ext in [".md", ".markdown"]:
            return "md", cls.parse_text(content_bytes)
        elif ext == ".csv":
            return "csv", cls.parse_csv(content_bytes)
        elif ext == ".json":
            return "json", cls.parse_json(content_bytes)
        else:
            # Fallback to general text decoding
            return "txt", cls.parse_text(content_bytes)
