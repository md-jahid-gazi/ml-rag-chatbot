# Sequence-to-Sequence Models & Attention Mechanism

## 1. Overview of Sequence-to-Sequence (Seq2Seq)
Sequence-to-Sequence (Seq2Seq) models are a class of neural network architectures designed to map an input sequence of variable length to an output sequence of variable length. Typical applications include Neural Machine Translation (NMT), text summarization, speech-to-text recognition, and conversational agents.

### Encoder-Decoder Architecture
A traditional Seq2Seq system (Sutskever et al., 2014) comprises two main components:
- **Encoder RNN**: Processes the input sequence token-by-token $x_1, x_2, \dots, x_T$ and compresses the entire information into a final hidden state vector $h_T$.
- **Decoder RNN**: Uses this final hidden state as its initial hidden state $s_0$ and autoregressively emits target tokens $y_1, y_2, \dots, y_{T'}$ until generating an end-of-sequence token `<EOS>`.

## 2. Training vs. Prediction (Inference)
- **Teacher Forcing (Training)**:
  During training, the ground-truth target token from the training corpus $y_{t-1}^*$ is fed as the input to the decoder at step $t$, rather than the model's actual prediction $\hat{y}_{t-1}$.
  The training objective minimizes the sum of cross-entropy losses over all decoding time steps:
  $$J = \frac{1}{T} \sum_{t=1}^T J_t$$
  where $J_t = -\log P(y_t^* \mid y_{<t}^*, X)$.
- **Autoregressive Inference (Prediction)**:
  During test/production time, true labels are unavailable. The decoder must feed its own predicted token $\hat{y}_{t-1}$ from the previous step as the input to the current step.
- **Decoding Strategies**:
  - **Greedy Search (Beam Size = 1)**: Selects the token with the highest probability $\arg\max P(y_t \mid \dots)$ at each step. Fast but vulnerable to local sub-optimal decisions.
  - **Beam Search**: Maintains the top-$k$ most probable sequence hypotheses across time steps, significantly improving translation coherence.

## 3. The Information Bottleneck Problem
In vanilla Seq2Seq models, all information from the input sentence must be compressed into a single, fixed-size vector (the encoder's final hidden state $h_T$).
- For long sentences (typically > 20-30 words), this causes severe information loss.
- Empirical results (Bahdanau et al., 2015) demonstrate that translation quality (BLEU score) degrades sharply as sequence length increases when no attention mechanism is used.

## 4. The Attention Mechanism (Bahdanau et al., 2015)
The attention mechanism addresses the bottleneck by allowing the decoder to dynamically attend to and retrieve information from all encoder hidden states at every decoding step.

### Attention Step-by-Step:
1. **Query ($q$)**: Derived from the current/previous decoder hidden state $s_{t-1}$.
2. **Keys ($k$)**: The encoder hidden states $h_1, h_2, \dots, h_T$.
3. **Values ($v$)**: Information vectors associated with keys (usually identical to $h_i$).
4. **Alignment Score ($e_{t, i}$)**: Measures the compatibility between query $s_{t-1}$ and key $h_i$.
5. **Attention Weights ($\alpha_{t, i}$)**: Softmax normalization across all input positions:
   $$\alpha_{t, i} = \frac{\exp(e_{t, i})}{\sum_{j=1}^T \exp(e_{t, j})}$$
6. **Context Vector ($c_t$)**: A weighted sum of the encoder states:
   $$c_t = \sum_{i=1}^T \alpha_{t, i} h_i$$
7. **Decoder Update**: The context vector $c_t$ is concatenated with the decoder state or input to predict the next word $\hat{y}_t$.

## 5. Attention Scoring Functions
- **Additive / MLP Attention (Bahdanau et al., 2015)**:
  $$a(q, k) = w_2^T \tanh(W_1 [q; k])$$
  Highly flexible and expressive, especially effective on large datasets.
- **Bilinear / General Attention (Luong et al., 2015)**:
  $$a(q, k) = q^T W k$$
  Uses a learnable matrix $W$ allowing different dimensions for query and key.
- **Dot-Product Attention (Luong et al., 2015)**:
  $$a(q, k) = q^T k$$
  Parameter-free, fast, but requires $\dim(q) = \dim(k)$.
- **Scaled Dot-Product Attention (Vaswani et al., 2017)**:
  $$a(q, k) = \frac{q^T k}{\sqrt{d_k}}$$
  Scales by the square root of key dimensionality $d_k$ to prevent the dot product from exploding and pushing softmax into near-zero gradient regions.

## 6. Applications of Attention
- **Neural Machine Translation (NMT)**: Resolves word-reordering differences between languages (e.g., French adjective-noun vs English noun-adjective) and stabilizes BLEU scores on long sentences.
- **Self-Attention**: Attends within the same sentence to capture intra-sentence syntax and semantics.
- **Image Captioning (Show, Attend and Tell)**: CNN extracts a spatial feature grid; the LSTM decoder attends to visual patches when generating specific descriptive words.
- **Speech Recognition**: Maps acoustic spectrogram frames over time to linguistic phonemes and characters.
- **Text Summarization**: Highlights salient sentences and clauses from source text to produce concise summaries.
