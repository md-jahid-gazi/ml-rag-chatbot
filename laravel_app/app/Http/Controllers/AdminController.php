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

    public function uploadDocument(string $title, string $filename, string $content, ?string $fileType = null): array
    {
        $content = trim($content);
        if (empty($content)) {
            return ['error' => 'Document content cannot be empty'];
        }

        // 1. Insert Document
        $stmt = $this->pdo->prepare("INSERT INTO documents (title, filename, file_type, file_size, num_chunks) VALUES (?, ?, ?, ?, ?)");
        $fileSize = strlen($content);
        $fileType = $fileType ?: (pathinfo($filename, PATHINFO_EXTENSION) ?: 'txt');
        $stmt->execute([$title, $filename, $fileType, $fileSize, 0]);
        $docId = $this->pdo->lastInsertId();

        // 2. Recursive & Paragraph Chunking (300-500 words per chunk with overlap)
        $paragraphs = preg_split('/\n\s*\n/', $content);
        $chunks = [];
        $currentChunk = '';

        foreach ($paragraphs as $para) {
            $para = trim($para);
            if (empty($para)) continue;

            if (str_word_count($currentChunk . ' ' . $para) > 350 && !empty($currentChunk)) {
                $chunks[] = trim($currentChunk);
                $currentChunk = $para;
            } else {
                $currentChunk .= (empty($currentChunk) ? '' : "\n\n") . $para;
            }
        }
        if (!empty(trim($currentChunk))) {
            $chunks[] = trim($currentChunk);
        }

        $stmtChunk = $this->pdo->prepare("INSERT INTO document_chunks (document_id, chunk_index, content, token_count) VALUES (?, ?, ?, ?)");
        $chunkIndex = 0;
        foreach ($chunks as $chunkText) {
            $tokenCount = str_word_count($chunkText);
            $stmtChunk->execute([$docId, $chunkIndex++, $chunkText, $tokenCount]);
        }

        // Update num_chunks
        $this->pdo->prepare("UPDATE documents SET num_chunks = ? WHERE id = ?")->execute([$chunkIndex, $docId]);

        return [
            'success' => true,
            'document_id' => (int)$docId,
            'title' => $title,
            'filename' => $filename,
            'file_type' => $fileType,
            'chunks_indexed' => $chunkIndex
        ];
    }

    /**
     * Process uploaded file (PDF, TXT, MD, HTML, CSV, JSON)
     */
    public function handleFileUpload(array $file, ?string $customTitle = null): array
    {
        $filename = basename($file['name'] ?? 'document.txt');
        $tmpPath = $file['tmp_name'] ?? '';
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $title = $customTitle ?: pathinfo($filename, PATHINFO_FILENAME);

        if (!file_exists($tmpPath) || filesize($tmpPath) === 0) {
            return ['error' => 'Uploaded file is invalid or empty'];
        }

        $content = '';
        if ($ext === 'pdf') {
            // AdminController is at laravel_app/app/Http/Controllers/AdminController.php
            $laravelAppDir = dirname(dirname(dirname(__DIR__)));
            $projectRoot = dirname($laravelAppDir);
            $candidates = [
                $projectRoot . DIRECTORY_SEPARATOR . '.venv' . DIRECTORY_SEPARATOR . 'Scripts' . DIRECTORY_SEPARATOR . 'python.exe',
                $projectRoot . DIRECTORY_SEPARATOR . 'venv' . DIRECTORY_SEPARATOR . 'Scripts' . DIRECTORY_SEPARATOR . 'python.exe',
                'python'
            ];
            $pythonBin = null;
            foreach ($candidates as $cand) {
                if ($cand === 'python' || file_exists($cand)) {
                    $pythonBin = $cand;
                    break;
                }
            }
            $scriptPath = $laravelAppDir . DIRECTORY_SEPARATOR . 'extract_pdf.py';

            if ($pythonBin && file_exists($scriptPath)) {
                $descriptors = [
                    0 => ['pipe', 'r'],
                    1 => ['pipe', 'w'],
                    2 => ['pipe', 'w'],
                ];
                $cmd = '"' . $pythonBin . '" "' . $scriptPath . '" "' . $tmpPath . '"';
                $proc = proc_open($cmd, $descriptors, $pipes);
                if (is_resource($proc)) {
                    $content = stream_get_contents($pipes[1]);
                    fclose($pipes[0]);
                    fclose($pipes[1]);
                    fclose($pipes[2]);
                    proc_close($proc);
                }
            }

            // Fallback pure PHP extraction with zlib / FlateDecode decompression
            if (empty(trim($content))) {
                $raw = @file_get_contents($tmpPath);
                if (!empty($raw)) {
                    if (preg_match_all('/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/m', $raw, $streams)) {
                        $decompressedText = '';
                        foreach ($streams[1] as $st) {
                            $uncompressed = @gzuncompress($st);
                            if ($uncompressed === false) {
                                $uncompressed = @gzinflate($st);
                            }
                            if ($uncompressed !== false) {
                                $decompressedText .= $uncompressed . "\n";
                            }
                        }
                        if (!empty($decompressedText)) {
                            if (preg_match_all('/\((.*?)\)\s*(?:Tj|TJ|\')/s', $decompressedText, $m)) {
                                $content = implode(" ", $m[1]);
                            }
                        }
                    }
                }
            }
        } elseif (in_array($ext, ['html', 'htm'])) {
            $raw = file_get_contents($tmpPath);
            $clean = preg_replace('/<(script|style|nav|footer|header)[^>]*>.*?<\/\\1>/si', '', $raw);
            $content = trim(strip_tags($clean));
        } else {
            // txt, md, csv, json, text formats
            $content = file_get_contents($tmpPath);
        }

        if (empty(trim($content))) {
            return ['error' => 'Could not extract readable text from uploaded ' . strtoupper($ext) . ' file'];
        }

        return $this->uploadDocument($title, $filename, $content, $ext);
    }

    /**
     * Scrape and ingest live webpage content from URL
     */
    public function scrapeAndIndexUrl(string $url): array
    {
        $url = trim($url);
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return ['error' => 'Invalid Web URL provided'];
        }

        $opts = [
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n",
                'timeout' => 12
            ]
        ];
        $context = stream_context_create($opts);
        $html = @file_get_contents($url, false, $context);

        if ($html === false) {
            return ['error' => 'Failed to fetch content from URL. Please check network connectivity or URL.'];
        }

        // Extract title
        $title = parse_url($url, PHP_URL_HOST);
        if (preg_match('/<title[^>]*>(.*?)<\/title>/si', $html, $m)) {
            $title = trim(html_entity_decode($m[1]));
        }

        // Clean HTML
        $clean = preg_replace('/<(script|style|nav|footer|header|aside|noscript)[^>]*>.*?<\/\\1>/si', '', $html);
        $text = strip_tags($clean);
        // Normalize whitespace
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n\s*\n+/', "\n\n", $text);
        $text = trim($text);

        if (strlen($text) < 50) {
            return ['error' => 'The provided URL did not contain sufficient textual content to index'];
        }

        $filename = parse_url($url, PHP_URL_HOST) . (parse_url($url, PHP_URL_PATH) ?: '/page');
        return $this->uploadDocument($title, $filename, $text, 'web');
    }

    public function deleteDocument(int $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM documents WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
