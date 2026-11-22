import { test, expect } from '@fixtures/booker.fixture';
import { buildBookingFromGenerator } from '@testdata/booking.data';

test.describe.serial('@e2e @P0 Level 3 - Booking lifecycle (token from fixture)', () => {
    // Shared state across serial tests
    let bookingId: number;

    // ─── CREATE ───────────────────────────────────────────────────────────────
    test('POST /booking — create a booking', async ({ bookingApi }) => {
        const payload = buildBookingFromGenerator({ firstname: 'E2E', lastname: 'Journey' });

        const { bookingid, booking } = await bookingApi.createBooking(payload);

        // Assert response shape
        expect(bookingid).toBeGreaterThan(0);
        expect(booking.firstname).toBe('E2E');       // toBe for primitives
        expect(booking.lastname).toBe('Journey');
        expect(booking.totalprice).toBeGreaterThan(0);
        expect(typeof booking.depositpaid).toBe('boolean');

        // Store for subsequent tests
        bookingId = bookingid;
    });

    // ─── READ ─────────────────────────────────────────────────────────────────
    test('GET /booking/:id — read the created booking back', async ({ bookingApi }) => {
        expect(bookingId, 'bookingId must be set — did the create test pass?').toBeDefined();

        const booking = await bookingApi.getBooking(bookingId);

        expect(booking.firstname).toBe('E2E');
        expect(booking.lastname).toBe('Journey');
    });

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    test('PUT /booking/:id — update and verify persisted', async ({ bookingApi }) => {
        expect(bookingId, 'bookingId must be set — did the create test pass?').toBeDefined();

        const updatePayload = buildBookingFromGenerator({
            firstname: 'E2E',
            lastname: 'Updated',
            totalprice: 950,
        });

        await test.step('PUT /booking — send update request', async () => {
            const updated = await bookingApi.updateBooking(bookingId, updatePayload);
            // Partial assertion — only check fields we explicitly set
            expect(updated).toMatchObject({
                firstname: 'E2E',
                lastname: 'Updated',
                totalprice: 950,
            });
        });

        await test.step('GET /booking — verify update persisted on server', async () => {
            const fetched = await bookingApi.getBooking(bookingId);
            expect(fetched.lastname).toBe('Updated');
            expect(fetched.totalprice).toBe(950);
        });
    });

    // ─── DELETE ───────────────────────────────────────────────────────────────
    test('DELETE /booking/:id — delete and verify 404', async ({ bookingApi }) => {
        expect(bookingId, 'bookingId must be set — did the create test pass?').toBeDefined();

        await test.step('DELETE /booking — send delete request', async () => {
            const status = await bookingApi.deleteBooking(bookingId);
            expect(status).toBe(201); // restful-booker returns 201 on delete
        });

        await test.step('GET /booking — verify booking is gone (404)', async () => {
            const response = await bookingApi.getBookingResponse(bookingId);
            expect(response.status()).toBe(404);
        });
    });
});

