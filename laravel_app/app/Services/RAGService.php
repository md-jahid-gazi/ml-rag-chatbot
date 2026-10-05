<?php

namespace App\Services;

use PDO;

class RAGService
{
    private PDO $pdo;
    private float $threshold = 0.28;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Process user query using strict retrieval grounding
     */
    public function answerQuery(string $query, string $sessionId = 'default-session'): array
    {
        $query = trim($query);

        // Fetch all indexed chunks with parent document metadata
        $stmt = $this->pdo->query("
            SELECT dc.id, dc.document_id, dc.chunk_index, dc.content, d.title as doc_title, d.filename as doc_filename
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
        ");
        $chunks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $scoredChunks = [];
        foreach ($chunks as $chunk) {
            $score = VectorService::calculateRelevance($query, $chunk['content']);
            if ($score > 0.05) {
                $chunk['score'] = $score;
                $scoredChunks[] = $chunk;
            }
        }

        // Sort descending by score
        usort($scoredChunks, fn($a, $b) => $b['score'] <=> $a['score']);

        $topChunk = $scoredChunks[0] ?? null;
        $maxScore = $topChunk ? $topChunk['score'] : 0.0;

        // Check if query is in scope
        $inScope = ($topChunk !== null && $maxScore >= $this->threshold);

        if (!$inScope) {
            $answer = "I apologize, but this information is not found in the provided knowledge base. "
                    . "I can only answer questions based strictly on the verified documents in the database.\n\n"
                    . "Available knowledge topics include:\n"
                    . "• Account Security & Password Reset Policy\n"
                    . "• Sequence-to-Sequence Models & Attention Mechanism\n"
                    . "• Transformers & BERT (Self-Attention, MLM/NSP)\n"
                    . "• Deep Generative Modeling (VAEs, Reparameterization Trick, GANs)";

            $sourceDoc = null;
            $sourceChunk = null;
        } else {
            // Grounded Answer strictly from the top matching chunk
            $answer = $topChunk['content'];
            $sourceDoc = $topChunk['doc_filename'];
            $sourceChunk = $topChunk['chunk_index'];
        }

        // Save messages in MySQL chat_messages table
        $this->saveMessage($sessionId, 'user', $query, null, null, 1.0, 1);
        $this->saveMessage($sessionId, 'assistant', $answer, $sourceDoc, $sourceChunk, $maxScore, $inScope ? 1 : 0);

        return [
            'answer' => $answer,
            'source_doc' => $sourceDoc,
            'source_chunk' => $sourceChunk,
            'confidence_score' => $maxScore,
            'in_scope' => $inScope
        ];
    }

    private function saveMessage(string $sessionId, string $sender, string $content, ?string $sourceDoc, ?int $sourceChunk, float $confidence, int $inScope): void
    {
        // Ensure session exists
        $stmtSess = $this->pdo->prepare("INSERT IGNORE INTO chat_sessions (id, title) VALUES (?, ?)");
        $stmtSess->execute([$sessionId, substr($content, 0, 40)]);

        $stmt = $this->pdo->prepare("
            INSERT INTO chat_messages (session_id, sender, content, source_doc, source_chunk, confidence_score, in_scope)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$sessionId, $sender, $content, $sourceDoc, $sourceChunk, $confidence, $inScope]);
    }
}
