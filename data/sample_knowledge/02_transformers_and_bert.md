# Transformers, Embeddings, and BERT

## 1. Word Representations & Embeddings
- **One-Hot Encoding**: Encodes each word as a sparse binary vector of vocabulary size $|V|$. Drawback: orthogonal vectors cannot express semantic similarity or distance.
- **Bag of Words (BoW)**: Tallies word frequencies across a document. Ignores syntactic ordering and grammar entirely.
- **Word Embeddings (CBOW / Skip-Gram)**: Continuous Bag of Words (CBOW) predicts a center target word given its surrounding context window (e.g., window size $ws = 3$). A hidden layer weight matrix of dimension $|V| \times d$ serves as the dense semantic lookup table.
- **Semantic Similarity**: Dense vectors allow measuring similarity using cosine similarity:
  $$\text{Cosine Similarity}(u, v) = \frac{u \cdot v}{\|u\| \|v\|}$$

## 2. Motivation for Positional Encoding
- Recurrent Neural Networks (RNNs) process tokens sequentially, inherently encoding chronological order.
- Transformers process all sequence tokens simultaneously in parallel. Without explicit position metadata, the Transformer is permutation-invariant.
- **Flawed approaches**:
  - Integer steps ($1, 2, 3, \dots$): Unbounded, fails to generalize to sequence lengths longer than seen during training.
  - Normalized range ($[0, 1]$): The interval between words changes depending on sentence length, corrupting relative distance meaning.
- **Sinusoidal Positional Encoding (Vaswani et al., 2017)**:
  For position $pos$ and dimension index $i$:
  $$PE_{(pos, 2k)} = \sin\left(\frac{pos}{10000^{2k/d_{\text{model}}}}\right)$$
  $$PE_{(pos, 2k+1)} = \cos\left(\frac{pos}{10000^{2k/d_{\text{model}}}}\right)$$
  - Properties: Deterministic, bounded $[-1, 1]$, handles unseen sentence lengths, and allows the model to learn relative position shifts easily.
  - Enhanced Embedding: Combined by vector addition:
    $$\vec{x}_{\text{enhanced}} = \vec{x}_{\text{token}} + \vec{x}_{\text{position}}$$

## 3. Self-Attention Mechanism
Self-attention enables each token in an input sequence to attend to all tokens within the same sequence.
- **Coreference Example**: "Bank will not approve loan as **it** is risky." Self-attention enables the pronoun "it" to heavily attend to "loan" rather than "bank".
- **Mathematical Computation**:
  Given packed matrix inputs:
  - Query Matrix: $Q = X W_Q$
  - Key Matrix: $K = X W_K$
  - Value Matrix: $V = X W_V$
  - Scaled Dot-Product Attention:
    $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V$$

## 4. Multi-Head Attention (MHA)
Single-head attention averages together different linguistic relationships into a single attention pattern.
- **Multi-Head Attention** projects queries, keys, and values $h$ times with distinct learnable parameter matrices:
  - Head 1: Captures coreference resolution (e.g., "it" $\rightarrow$ "animal").
  - Head 2: Captures syntactic action-object pairs (e.g., "cross" $\rightarrow$ "street").
  - Head 3: Captures causality and modifier relations (e.g., "tired" $\rightarrow$ "animal").
- Outputs from all $h$ heads are concatenated and linearly projected back:
  $$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h) W^O$$

## 5. Masked Multi-Head Attention
In autoregressive decoders, masked attention applies a lower-triangular causal mask. Positions are prevented from attending to subsequent tokens (future words) by setting their pre-softmax attention logits to $-\infty$. This guarantees that training behavior matches real-time left-to-right inference generation without future information leakage.

## 6. BERT: Bidirectional Encoder Representations from Transformers
BERT (Devlin et al., 2018) is an encoder-only Transformer pre-trained on vast unlabeled corpora to generate deep bidirectional contextual embeddings.

### Architecture Configurations:
- $\text{BERT}_{\text{BASE}}$: 12 Encoder layers, 12 Attention heads, 768 hidden dimensions, 110M parameters.
- $\text{BERT}_{\text{LARGE}}$: 24 Encoder layers, 16 Attention heads, 1024 hidden dimensions, 340M parameters.

### Input Embeddings Structure:
Input to BERT is the sum of three embeddings for each WordPiece token:
$$\text{Input Vector} = \text{Token Embedding} + \text{Segment Embedding} (E_A \text{ vs } E_B) + \text{Position Embedding}$$
- `[CLS]` token: prepended to every sequence. Its final hidden state serves as the aggregate representation for sentence-level classification.
- `[SEP]` token: separates sentence pairs or denotes end of sequence.

### Pre-training Objectives:
1. **Masked Language Modeling (MLM)**: Randomly masks $15\%$ of input tokens. The model predicts the original identity of the masked tokens using bidirectional context.
2. **Next Sentence Prediction (NSP)**: Binary classification determining if sentence B directly follows sentence A in the natural corpus.

### Downstream Fine-Tuning:
By adding a single task-specific output layer, BERT can be fine-tuned with minimal architectural modifications:
- Single Sentence Classification (Sentiment Analysis, Spam detection) via `[CLS]`.
- Sentence Pair Classification (NLI, Semantic textual similarity) via `[CLS]`.
- Question Answering (SQuAD): predicting span start and span end probability for candidate answer tokens.
- Named Entity Recognition (NER) & POS tagging: token-level token classification.
