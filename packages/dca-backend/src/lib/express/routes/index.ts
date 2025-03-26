import cors from 'cors';
import express, { Express } from 'express';

import { listPurchases } from './purchases';
import { getSchedules, enableSchedule, disableSchedule, createSchedule } from './schedules';
import { env } from '../../env';
import { serviceLogger } from '../../logger';

const { CORS_ALLOWED_DOMAIN, IS_DEVELOPMENT } = env;

const corsConfig = {
  optionsSuccessStatus: 204,
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(new Error('Not allowed by CORS'));
      return;
    }

    const allowedOrigins = [
      // eslint-disable-next-line no-useless-escape
      new RegExp(`^https?:\/\/${CORS_ALLOWED_DOMAIN}$`),
    ];

    if (IS_DEVELOPMENT) {
      // localhost with any port only allowed when not running in production
      allowedOrigins.push(/^https?:\/\/localhost(:\d+)?$/);
    }

    if (allowedOrigins.some((regex) => regex.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

export const registerRoutes = (app: Express) => {
  app.use(express.json());

  if (IS_DEVELOPMENT) {
    serviceLogger.info(`CORS is disabled for development`);
  } else {
    serviceLogger.info(`Configuring CORS with allowed domain: ${CORS_ALLOWED_DOMAIN}`);
  }
  app.use(cors(corsConfig));

  app.get('/purchases', listPurchases);
  app.get('/schedules', getSchedules);
  app.post('/schedule', createSchedule);
  app.put('/schedules/:scheduleId/enable', enableSchedule);
  app.put('/schedules/:scheduleId/disable', disableSchedule);

  serviceLogger.info(`Routes registered`);
};
