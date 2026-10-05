# Machine Learning Course FAQ and Project Guidelines

## Course Information: BRACU Machine Learning
- **Course Focus**: Advanced Deep Learning, Natural Language Processing (NLP), Computer Vision, and Generative Modeling.
- **Instructors & Lab Focus**: Foundations of Sequence-to-Sequence modeling, Attention Mechanisms, Transformer architectures, Pretrained Language Models (BERT, GPT), Latent Variable Models (Autoencoders, VAEs), and Generative Adversarial Networks (GANs).

## Core Project Guidelines: AI-Powered Knowledge Chatbot
- **Goal**: Develop an end-to-end question answering system trained exclusively on provided knowledge bases.
- **Strict Grounding Rule**: The system must answer user inquiries solely based on the uploaded course and topic materials. If an inquiry falls outside the indexed knowledge (e.g. general sports scores, celebrity gossip, unrelated cooking recipes, or undocumented external topics), the chatbot must politely decline, explain that the requested information is absent from its knowledge base, and invite questions regarding indexed topics.
- **Evaluation Criteria**:
  1. Faithfulness to retrieved context (no hallucinations).
  2. Multi-format support (PDF, TXT, Markdown, Web Scraping).
  3. Incremental updates without full index retraining.
  4. Conversation memory over multi-turn dialogues.
  5. Authentication and role-based access control (Admin vs User).
  6. Structured logging and interactive API documentation.
