-- ==========================================================
-- AI Knowledge Chatbot Database Schema for MySQL
-- Database: knowledge_chatbot
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `knowledge_chatbot` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `knowledge_chatbot`;

-- Drop existing tables
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_sessions`;
DROP TABLE IF EXISTS `document_chunks`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'user') DEFAULT 'user',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `email`, `password`, `role`) VALUES
('admin', 'admin@bracu.ac.bd', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 2. Documents Table (Matches Image 2 Admin Console Ingestion)
CREATE TABLE `documents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(50) DEFAULT 'pdf',
    `file_size` INT DEFAULT 0,
    `num_chunks` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Document Chunks Table (Vector Database / Knowledge Base Index)
CREATE TABLE `document_chunks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `document_id` INT NOT NULL,
    `chunk_index` INT NOT NULL,
    `content` TEXT NOT NULL,
    `vector_json` LONGTEXT NULL, -- Stored embedding array for vector cosine distance
    `token_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Chat Sessions Table
CREATE TABLE `chat_sessions` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(255) DEFAULT 'New Conversation',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Chat Messages Table (Matches Image 1 KnowledgeBot with Source Citation)
CREATE TABLE `chat_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(64) NOT NULL,
    `sender` ENUM('user', 'assistant') NOT NULL,
    `content` TEXT NOT NULL,
    `source_doc` VARCHAR(255) NULL,
    `source_chunk` INT NULL,
    `confidence_score` FLOAT DEFAULT 0.0,
    `in_scope` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED SAMPLE KNOWLEDGE BASE (Including Account_Security.pdf)
-- ==========================================================

INSERT INTO `documents` (`id`, `title`, `filename`, `file_type`, `file_size`, `num_chunks`) VALUES
(1, 'Account Security', 'Account_Security.pdf', 'pdf', 10420, 2),
(2, 'Sequence-to-Sequence and Attention', '01_sequence_to_sequence_and_attention.md', 'md', 15200, 3),
(3, 'Transformers and BERT', '02_transformers_and_bert.md', 'md', 18400, 3),
(4, 'Deep Generative Modeling (VAEs and GANs)', '03_generative_models_vaes_and_gans.md', 'md', 16800, 3);

-- Chunks for Account_Security.pdf (Directly matching Image 1!)
INSERT INTO `document_chunks` (`document_id`, `chunk_index`, `content`, `token_count`) VALUES
(1, 0, 'According to the "Account Security" document, you can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your registered email.', 28),
(1, 1, 'Two-Factor Authentication (2FA) is strongly recommended for all accounts. When enabled, users must provide a 6-digit one-time verification passcode in addition to their password during login.', 25),

-- Chunks for Seq2Seq & Attention
(2, 0, 'Sequence-to-Sequence (Seq2Seq) architectures use an Encoder to compress input sequences into a vector and a Decoder to generate the output sequence. In traditional models, passing only the final hidden state creates an Information Bottleneck, causing performance (BLEU score) to degrade on long sentences.', 45),
(2, 1, 'The Attention mechanism allows the decoder to dynamically attend to all encoder hidden states. It computes query-key alignment scores e_{t,i} and attention weights alpha_{t,i} via softmax, generating a dynamic context vector c_t as a weighted sum of encoder hidden states.', 42),
(2, 2, 'Attention score functions include Additive/MLP (Bahdanau), Bilinear (Luong), Dot Product (Luong), and Scaled Dot-Product (Vaswani et al.). Scaled Dot-Product scales by sqrt(d_k) to prevent vanishing gradients during softmax.', 35),

-- Chunks for Transformers & BERT
(3, 0, 'Transformers process all sequence tokens simultaneously in parallel, requiring Positional Encoding to capture token order. Sinusoidal positional encodings use sine and cosine functions of varying frequencies, allowing deterministic relative distance learning.', 36),
(3, 1, 'Self-Attention projects input embeddings into Query (Q), Key (K), and Value (V) matrices. The output is computed as Attention(Q,K,V) = softmax(Q K^T / sqrt(d_k)) V. Multi-Head Attention runs multiple projections in parallel to capture distinct relationships like coreference and syntax.', 42),
(3, 2, 'BERT (Bidirectional Encoder Representations from Transformers) is an encoder-only model. It is pre-trained using Masked Language Modeling (MLM, predicting 15% masked tokens) and Next Sentence Prediction (NSP). It produces deep bidirectional contextual representations.', 38),

-- Chunks for Generative Models
(4, 0, 'Variational Autoencoders (VAEs) are probabilistic latent variable models. The encoder outputs mean mu and variance sigma of a Gaussian distribution. The loss function balances Reconstruction Loss with KL Divergence against a standard normal prior N(0, I).', 39),
(4, 1, 'The Reparameterization Trick enables gradient backpropagation through stochastic sampling by isolating random noise epsilon ~ N(0, I): z = mu + sigma * epsilon. This makes the sampling node differentiable with respect to encoder parameters.', 36),
(4, 2, 'Generative Adversarial Networks (GANs) pit two neural networks in a minimax game: min_G max_D V(D, G). The Generator G creates synthetic imitations from noise z, while the Discriminator D attempts to classify real versus fake samples.', 38);
