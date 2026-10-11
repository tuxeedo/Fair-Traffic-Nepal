import json
from pathlib import Path
from django.contrib.auth import get_user_model
from django.test import SimpleTestCase
from rest_framework.test import APITestCase
from .models import Vehicle
from .serializers import VehicleSerializer
from .validators import normalize_registration_number, normalize_bluebook_number


class IdentifierFormatTests(SimpleTestCase):
    def test_supported_formats_and_invalid_symbols(self):
        cases = json.loads(Path(__file__).with_name('identifier_cases.json').read_text(encoding='utf-8'))
        for kind, normalizer in [('registration', normalize_registration_number), ('bluebook', normalize_bluebook_number)]:
            for value, expected in cases[kind]:
                with self.subTest(kind=kind, value=value):
                    if expected is None:
                        with self.assertRaises(ValueError):
                            normalizer(value)
                    else:
                        self.assertEqual(normalizer(value), expected)


class VehicleValidationTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='vehicle_validation', role='citizen', email='vehicle@example.test', password='test-password')
        self.client.force_authenticate(self.user)
        self.payload = {'registration_number': 'बा २ प १२३४', 'bluebook_number': 'BB-१२३४/८२', 'vehicle_type': 'motorcycle', 'brand': 'Honda', 'model': 'CB', 'registration_date': '2026-01-01'}

    def test_api_create_normalizes_and_rejects_duplicate_identifiers(self):
        response = self.client.post('/api/v1/vehicles/my/', self.payload)
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['registration_number'], 'BA 2 PA 1234')
        self.assertEqual(response.data['bluebook_number'], 'BB-1234/82')
        duplicate = {**self.payload, 'registration_number': 'ba2pa1234', 'bluebook_number': 'bb-1234/82'}
        response = self.client.post('/api/v1/vehicles/my/', duplicate)
        self.assertEqual(response.status_code, 400)
        self.assertIn('registration_number', response.data)
        self.assertIn('bluebook_number', response.data)
        self.assertEqual(Vehicle.objects.count(), 1)

    def test_api_create_rejects_both_invalid_fields(self):
        response = self.client.post('/api/v1/vehicles/my/', {**self.payload, 'registration_number': 'whatever123!', 'bluebook_number': 'book@123'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('registration_number', response.data)
        self.assertIn('bluebook_number', response.data)
        self.assertEqual(Vehicle.objects.count(), 0)

    def test_edit_validation_and_unchanged_historical_values(self):
        vehicle = Vehicle.objects.create(owner=self.user, registration_number='OLD-DEMO-PLATE', bluebook_number='OLD@BOOK', vehicle_type='motorcycle', brand='Honda', model='CB')
        response = self.client.patch(f'/api/v1/vehicles/my/{vehicle.id}/', {'registration_number': vehicle.registration_number, 'bluebook_number': vehicle.bluebook_number, 'color': 'Red'})
        self.assertEqual(response.status_code, 200, response.data)
        response = self.client.patch(f'/api/v1/vehicles/my/{vehicle.id}/', {'registration_number': 'new-invalid!', 'bluebook_number': 'new@123'})
        self.assertEqual(response.status_code, 400)
        vehicle.refresh_from_db()
        self.assertEqual(vehicle.registration_number, 'OLD-DEMO-PLATE')
        response = self.client.patch(f'/api/v1/vehicles/my/{vehicle.id}/', self.payload)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['registration_number'], 'BA 2 PA 1234')

    def test_partial_update_and_verified_vehicle_rule_still_work(self):
        vehicle = Vehicle.objects.create(owner=self.user, registration_number='BA 2 PA 1234', bluebook_number='BB-1234', vehicle_type='motorcycle', brand='Honda', model='CB')
        serializer = VehicleSerializer(vehicle, data={'color': 'Blue'}, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        vehicle.verification_status = Vehicle.VerificationStatus.VERIFIED
        vehicle.save()
        response = self.client.patch(f'/api/v1/vehicles/my/{vehicle.id}/', {'color': 'Blue'})
        self.assertEqual(response.status_code, 400)
