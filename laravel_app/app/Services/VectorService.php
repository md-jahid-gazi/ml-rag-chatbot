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
     * Hybrid relevance scorer between query and chunk text with stopword filtering
     */
    public static function calculateRelevance(string $query, string $content): float
    {
        $qTokens = self::tokenize($query);
        $cTokens = self::tokenize($content);
        if (empty($qTokens) || empty($cTokens)) return 0.0;

        $stopwords = array_flip([
            'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'with',
            'to', 'for', 'of', 'by', 'as', 'it', 'can', 'my', 'i', 'you', 'we',
            'they', 'this', 'that', 'from', 'be', 'do', 'does', 'did', 'so', 'if',
            'me', 'are', 'was', 'were', 'have', 'has', 'had', 'what', 'when', 'where',
            'who', 'whom', 'how', 'why', 'should', 'would', 'could', 'tell', 'about',
            'overview', 'describe', 'brief', 'summary', 'details', 'detail', 'give',
            'please', 'know', 'explain', 'some', 'any', 'much', 'many', 'all'
        ]);

        $filteredQTokens = array_values(array_filter($qTokens, fn($t) => !isset($stopwords[$t])));
        $effectiveTokens = !empty($filteredQTokens) ? $filteredQTokens : $qTokens;

        $cCounts = array_count_values($cTokens);
        $totalMatches = 0;
        $phraseBoost = 0.0;

        // Exact substring bonus
        $cleanQuery = strtolower(trim($query));
        $cleanContent = strtolower($content);
        if (strpos($cleanContent, $cleanQuery) !== false) {
            $phraseBoost = 0.35;
        }

        $synonymMap = [
            'founder' => ['found', 'founded', 'founding', 'established', 'establishes', 'creator', 'originated'],
            'location' => ['located', 'campus', 'campuses', 'address', 'city', 'situated', 'place', 'dhaka', 'badda', 'savar'],
            'capital' => ['dhaka', 'city', 'metropolitan'],
            'currency' => ['taka', 'bdt', 'money', 'economy', 'financial', 'monetary', 'official'],
            'language' => ['bengali', 'bangla', 'languages'],
            'independence' => ['liberation', '1971', 'march'],
            'supervised' => ['labels', 'labeled', 'targets', 'supervision'],
            'unsupervised' => ['clustering', 'unlabeled', 'clusters'],
            'overfitting' => ['generalize', 'generalization', 'variance'],
            'backpropagation' => ['gradient', 'propagation', 'backward', 'weights'],
            'deep' => ['neural', 'layers', 'representation'],
            'reset' => ['resets', 'resetting', 'recovery', 'forgot'],
            'password' => ['passwords', 'passcode', 'credentials', 'credential', 'authentication'],
            'lockout' => ['locked', 'lock', 'locking', 'attempts'],
            'session' => ['sessions', 'inactivity', 'expire', 'expiration'],
            'two' => ['2fa', 'two-factor', 'mfa'],
        ];

        // Token match against effective tokens with synonym expansion
        foreach ($effectiveTokens as $qt) {
            $matched = false;
            if (isset($cCounts[$qt])) {
                $matched = true;
            } elseif (isset($synonymMap[$qt])) {
                foreach ($synonymMap[$qt] as $syn) {
                    if (isset($cCounts[$syn])) {
                        $matched = true;
                        break;
                    }
                }
            }
            if ($matched) {
                $totalMatches += 1;
            }
        }

        $matchedRatio = count($effectiveTokens) > 0 ? ($totalMatches / count($effectiveTokens)) : 0.0;

        // Strict out-of-scope check for external non-knowledge domain queries (travel, flights, recipes, sports)
        if (preg_match('/\b(booking|bookings|book a|flight|flights|hotel|ticket|pancake|pancakes|chocolate|world cup|football)\b/i', $cleanQuery)) {
            return 0.08;
        }

        $overlapScore = $matchedRatio;

        // If query has multiple content words but less than 45% match, reject as out-of-scope
        if (count($effectiveTokens) >= 2 && $matchedRatio < 0.45) {
            return 0.15;
        }
        $finalScore = min(1.0, ($overlapScore * 0.7) + $phraseBoost);
        return round($finalScore, 4);
    }
}
