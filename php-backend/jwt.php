<?php
require_once __DIR__ . '/config.php';

/**
 * Minimal HS256 JWT implementation – no external library needed.
 */
class JWT {

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function sign(array $payload): string {
        $header = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );
        return "$header.$payload.$signature";
    }

    /** @return array|false  Returns decoded payload or false on failure */
    public static function verify(string $token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        [$header, $payload, $signature] = $parts;
        $expected = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );
        if (!hash_equals($expected, $signature)) return false;

        $decoded = json_decode(self::base64UrlDecode($payload), true);

        // Check expiry if present
        if (isset($decoded['exp']) && $decoded['exp'] < time()) return false;

        return $decoded;
    }
}
