import { test, expect } from '@playwright/test';
import { logger } from '@utils/logger';
import { json } from 'node:stream/consumers';

//  Ping Request.
// Ping request help you to test if the server is up.
// Client -> Server to check if all well.

// HTTP GET -> https://restful-booker.herokuapp.com/ping

test('TC#1 @p0 - POST : Verify that create booking is working fine.', async ({ request }) => {


    const payload= {
        firstname: 'Jim',
         lastname: 'Brown',
                totalprice: 111,
                depositpaid: true,
                bookingdates: {
                        checkin: '2018-01-01',
                        checkout: '2019-01-01',
                },
                 additionalneeds: 'Breakfast',
    }
    logger.info(`payload is set:${JSON.stringify(payload)}`)
    const headers = {
        'Accept':'application/json',
        'Content-Type': 'application/json',
    }
      logger.info(`Header is set: ${JSON.stringify(headers)

      }`);
      const responseData = await request.post('/booking',{
        data:payload,
        headers:headers
      })

       expect(responseData.status()).toBe(200);
        const data = await responseData.json();
        logger.info(`Response is set: ${JSON.stringify(data)}`)
        expect (data.bookingid).toBeTruthy()
        expect(data.booking.firstname).toBe(payload.firstname);
      expect(data.booking.lastname).toBe(payload.lastname);
      expect(data.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin)

logger.info(`Created booking id: ${data.bookingid}`);
    })
