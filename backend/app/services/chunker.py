import re
from typing import List, Dict, Any
from backend.app.config import settings

class RecursiveChunker:
    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    def chunk_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Recursively splits text into cohesive chunks with sliding overlap.
        Preserves paragraph and sentence boundaries wherever possible.
        """
        if not text or not text.strip():
            return []

        # Split into initial paragraphs
        paragraphs = re.split(r'\n\s*\n', text.strip())
        raw_chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # If adding this paragraph exceeds chunk size, split or wrap
            if len(current_chunk) + len(para) + 2 <= self.chunk_size:
                current_chunk = f"{current_chunk}\n\n{para}".strip()
            else:
                if current_chunk:
                    raw_chunks.append(current_chunk)
                
                # If paragraph itself is larger than chunk size, split by sentences
                if len(para) > self.chunk_size:
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    sub_chunk = ""
                    for sent in sentences:
                        sent = sent.strip()
                        if not sent:
                            continue
                        if len(sub_chunk) + len(sent) + 1 <= self.chunk_size:
                            sub_chunk = f"{sub_chunk} {sent}".strip()
                        else:
                            if sub_chunk:
                                raw_chunks.append(sub_chunk)
                            # Handle oversized sentences by simple character slicing
                            if len(sent) > self.chunk_size:
                                for i in range(0, len(sent), self.chunk_size - self.chunk_overlap):
                                    raw_chunks.append(sent[i:i + self.chunk_size])
                                sub_chunk = ""
                            else:
                                sub_chunk = sent
                    if sub_chunk:
                        current_chunk = sub_chunk
                else:
                    current_chunk = para

        if current_chunk:
            raw_chunks.append(current_chunk)

        # Now apply overlap stitching
        processed_chunks = []
        for i, chunk_text in enumerate(raw_chunks):
            # Estimate tokens roughly (~4 chars per token)
            token_count = max(1, len(chunk_text.split()))
            processed_chunks.append({
                "chunk_index": i,
                "content": chunk_text.strip(),
                "token_count": token_count,
                "char_length": len(chunk_text.strip())
            })

        return processed_chunks
