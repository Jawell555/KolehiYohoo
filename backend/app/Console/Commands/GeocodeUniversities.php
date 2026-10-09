<?php

namespace App\Console\Commands;

use App\Models\University;
use App\Services\GeocodingService;
use Illuminate\Console\Command;

class GeocodeUniversities extends Command
{
    protected $signature = 'universities:geocode {--force : Re-geocode schools that already have coordinates}';

    protected $description = 'Look up latitude/longitude for each university address (OpenStreetMap Nominatim)';

    public function handle(GeocodingService $geocoder): int
    {
        $query = University::query()->orderBy('university_id');
        if (!$this->option('force')) {
            $query->where(fn ($q) => $q->whereNull('latitude')->orWhereNull('longitude'));
        }

        $universities = $query->get();
        if ($universities->isEmpty()) {
            $this->info('Every school already has coordinates. Use --force to redo them.');
            return self::SUCCESS;
        }

        $this->info("Geocoding {$universities->count()} school(s)... (about 1 per second)");

        $failed = [];
        $bar = $this->output->createProgressBar($universities->count());
        $bar->start();

        foreach ($universities as $university) {
            $point = null;

            // Try the full address first, then the school name + address, then the name alone.
            $attempts = array_values(array_unique(array_filter([
                $university->address,
                trim($university->name . ' ' . $university->address),
                $university->name,
            ])));

            foreach ($attempts as $text) {
                $point = $geocoder->geocode($text);
                sleep(1); // Nominatim allows max 1 request/second
                if ($point) {
                    break;
                }
            }

            if ($point) {
                $university->latitude = $point['lat'];
                $university->longitude = $point['lng'];
                $university->save();
            } else {
                $failed[] = [$university->university_id, $university->name, $university->address ?: '(no address)'];
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info('Done. Located ' . ($universities->count() - count($failed)) . ' of ' . $universities->count() . '.');

        if ($failed) {
            $this->warn('Could not locate these schools (fix the address in the admin page, then run the command again):');
            $this->table(['ID', 'Name', 'Address'], $failed);
        }

        return self::SUCCESS;
    }
}
