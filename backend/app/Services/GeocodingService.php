<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Turns a place name / address into coordinates using the free
 * OpenStreetMap Nominatim API (no API key needed).
 *
 * Nominatim usage policy: max 1 request per second, and a real User-Agent is required.
 * Results are cached so repeated searches never hit the API again.
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * To switch to another provider (Google, LocationIQ, Geoapify...), only this class changes.
 */
class GeocodingService
{
    /**
     * @return array{lat: float, lng: float, label: string}|null  null when nothing was found
     */
    public function geocode(string $query): ?array
    {
        $query = trim(preg_replace('/\s+/', ' ', $query));
        if ($query === '') {
            return null;
        }

        $cacheKey = 'geocode:' . md5(mb_strtolower($query));

        // Only successful lookups are cached (Cache::get returns null on a miss).
        if (($cached = Cache::get($cacheKey)) !== null) {
            return $cached;
        }

        $result = $this->lookup($query);

        if ($result !== null) {
            Cache::put($cacheKey, $result, now()->addDays(30));
        }

        return $result;
    }

    private function lookup(string $query): ?array
    {
        $config = config('services.geocoding');

        try {
            $response = Http::timeout(8)
                ->withHeaders([
                    'User-Agent' => $config['user_agent'],
                    'Accept-Language' => 'en',
                ])
                ->get(rtrim($config['url'], '/') . '/search', array_filter([
                    'q' => $query,
                    'format' => 'jsonv2',
                    'limit' => 1,
                    'countrycodes' => $config['country'],
                ]));

            if (!$response->successful()) {
                Log::warning('Geocoding failed', ['status' => $response->status(), 'query' => $query]);
                return null;
            }

            $first = $response->json(0);
            if (!$first || !isset($first['lat'], $first['lon'])) {
                return null;
            }

            return [
                'lat' => (float) $first['lat'],
                'lng' => (float) $first['lon'],
                'label' => (string) ($first['display_name'] ?? $query),
            ];
        } catch (\Throwable $e) {
            Log::warning('Geocoding error: ' . $e->getMessage(), ['query' => $query]);
            return null;
        }
    }
}
