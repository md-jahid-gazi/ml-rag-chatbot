<?php

namespace App\Http\Controllers;

use App\Services\RAGService;
use PDO;

class ChatController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function handleChat(array $input): array
    {
        $query = $input['query'] ?? '';
        $sessionId = $input['session_id'] ?? 'session_' . time();

        if (empty(trim($query))) {
            return ['error' => 'Query cannot be empty'];
        }

        $rag = new RAGService($this->pdo);
        $response = $rag->answerQuery($query, $sessionId);
        $response['session_id'] = $sessionId;

        return $response;
    }

    public function getHistory(string $sessionId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT sender, content, source_doc, source_chunk, confidence_score, in_scope, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY created_at ASC
        ");
        $stmt->execute([$sessionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
