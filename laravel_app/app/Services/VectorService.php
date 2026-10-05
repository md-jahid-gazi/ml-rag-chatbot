<?php

namespace App\Services;

class VectorService
{
    /**
     * Tokenize text into normalized word tokens
     */
    public static function tokenize(string $text): array
    {
        $text = strtolower(strip_tags($text));
        preg_match_all('/[a-z0-9_]{2,}/', $text, $matches);
        return $matches[0] ?? [];
    }

    /**
     * Compute term frequency vector for a text given a vocabulary
     */
    public static function computeTfVector(string $text, array $vocab): array
    {
        $tokens = self::tokenize($text);
        $counts = array_count_values($tokens);
        $vec = [];
        $sumSq = 0.0;

        foreach ($vocab as $word => $idx) {
            $val = $counts[$word] ?? 0;
            $vec[$idx] = $val;
            $sumSq += $val * $val;
        }

        // L2 Normalization
        $norm = sqrt($sumSq);
        if ($norm > 0) {
            foreach ($vec as $idx => $val) {
                $vec[$idx] = $val / $norm;
            }
        }
        return $vec;
    }

    /**
     * Compute Cosine Similarity / Dot Product between two normalized vectors
     * Formula from lecture slides: Dot Product a(q, k) = q^T k
     */
    public static function cosineSimilarity(array $vecA, array $vecB): float
    {
        $dot = 0.0;
        foreach ($vecA as $idx => $valA) {
            if (isset($vecB[$idx])) {
                $dot += $valA * $vecB[$idx];
            }
        }
        return $dot;
    }

    /**
     * Hybrid relevance scorer between query and chunk text
     */
    public static function calculateRelevance(string $query, string $content): float
    {
        $qTokens = self::tokenize($query);
        $cTokens = self::tokenize($content);
        if (empty($qTokens) || empty($cTokens)) return 0.0;

        $cCounts = array_count_values($cTokens);
        $totalMatches = 0;
        $phraseBoost = 0.0;

        // Exact substring bonus
        $cleanQuery = strtolower(trim($query));
        $cleanContent = strtolower($content);
        if (strpos($cleanContent, $cleanQuery) !== false) {
            $phraseBoost = 0.35;
        }

        // Token match
        foreach ($qTokens as $qt) {
            if (isset($cCounts[$qt])) {
                $totalMatches += 1;
            }
        }

        $overlapScore = $totalMatches / count($qTokens);
        $finalScore = min(1.0, ($overlapScore * 0.7) + $phraseBoost);
        return round($finalScore, 4);
    }
}
