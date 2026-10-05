<?php

namespace App\Http\Controllers;

use PDO;

class AdminController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getStats(): array
    {
        $docCount = $this->pdo->query("SELECT COUNT(*) FROM documents")->fetchColumn();
        $chunkCount = $this->pdo->query("SELECT COUNT(*) FROM document_chunks")->fetchColumn();
        $msgCount = $this->pdo->query("SELECT COUNT(*) FROM chat_messages")->fetchColumn();

        $docs = $this->pdo->query("SELECT * FROM documents ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total_documents' => (int)$docCount,
            'total_chunks' => (int)$chunkCount,
            'total_messages' => (int)$msgCount,
            'documents' => $docs
        ];
    }

    public function uploadDocument(string $title, string $filename, string $content): array
    {
        // 1. Insert Document
        $stmt = $this->pdo->prepare("INSERT INTO documents (title, filename, file_type, file_size, num_chunks) VALUES (?, ?, ?, ?, ?)");
        $fileSize = strlen($content);
        $fileType = pathinfo($filename, PATHINFO_EXTENSION) ?: 'txt';
        $stmt->execute([$title, $filename, $fileType, $fileSize, 0]);
        $docId = $this->pdo->lastInsertId();

        // 2. Simple Recursive Chunking
        $paragraphs = preg_split('/\n\s*\n/', trim($content));
        $chunkIndex = 0;

        $stmtChunk = $this->pdo->prepare("INSERT INTO document_chunks (document_id, chunk_index, content, token_count) VALUES (?, ?, ?, ?)");

        foreach ($paragraphs as $para) {
            $para = trim($para);
            if (!empty($para)) {
                $tokenCount = str_word_count($para);
                $stmtChunk->execute([$docId, $chunkIndex++, $para, $tokenCount]);
            }
        }

        // Update num_chunks
        $this->pdo->prepare("UPDATE documents SET num_chunks = ? WHERE id = ?")->execute([$chunkIndex, $docId]);

        return [
            'success' => true,
            'document_id' => $docId,
            'title' => $title,
            'chunks_indexed' => $chunkIndex
        ];
    }

    public function deleteDocument(int $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM documents WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
