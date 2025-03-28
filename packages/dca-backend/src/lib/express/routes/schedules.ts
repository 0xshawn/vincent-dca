import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { disableJob, enableJob } from '../../scheduleManager/jobs';
import {
  createSchedule,
  deleteSchedule,
  editSchedule,
  listSchedules,
} from '../../scheduleManager/schedules';
import { CreateScheduleParams, EditScheduleParams } from '../../types';

function getWalletAddressFromRequest(req: Request): string | undefined {
  return req.user?.pkp.address;
}

export const handleListSchedulesRoute = async (req: Request, res: Response) => {
  try {
    const walletAddress = getWalletAddressFromRequest(req);

    if (!walletAddress) {
      res.status(400).json({ error: 'No wallet address provided' });
      return;
    }

    const schedules = await listSchedules({ walletAddress });

    if (!schedules || schedules.length === 0) {
      res.status(404).json({
        error: `No DCA schedules found for wallet address ${walletAddress}`,
      });
      return;
    }

    res.json({ data: schedules, success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const handleCreateScheduleRoute = async (req: Request, res: Response) => {
  try {
    const walletAddress = getWalletAddressFromRequest(req);

    if (!walletAddress) {
      res.status(400).json({ error: 'No wallet address provided' });
      return;
    }

    const scheduleData = { ...req.body, walletAddress } as CreateScheduleParams;

    const { schedule } = await createSchedule(scheduleData);
    res.status(201).json({ data: schedule, success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const handleEditScheduleRoute = async (req: Request, res: Response) => {
  try {
    const walletAddress = getWalletAddressFromRequest(req);
    const { scheduleId } = req.params as { scheduleId: string };

    if (!walletAddress) {
      res.status(400).json({ error: 'No wallet address provided' });
      return;
    }

    const scheduleData = { ...req.body, scheduleId, walletAddress } as EditScheduleParams;

    const { schedule } = await editSchedule(scheduleData);
    res.status(201).json({ data: schedule, success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const handleDisableScheduleRoute = async (req: Request, res: Response) => {
  try {
    const walletAddress = getWalletAddressFromRequest(req);
    const { scheduleId } = req.params as { scheduleId: string };

    if (!walletAddress) {
      res.status(400).json({ error: 'No wallet address provided' });
      return;
    }

    const job = await disableJob({ scheduleId: new Types.ObjectId(scheduleId) });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({ data: job.toJson(), success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const handleEnableScheduleRoute = async (req: Request, res: Response) => {
  try {
    const walletAddress = getWalletAddressFromRequest(req);
    const { scheduleId } = req.params as { scheduleId: string };

    if (!walletAddress) {
      res.status(400).json({ error: 'No wallet address provided' });
      return;
    }

    const job = await enableJob({ scheduleId: new Types.ObjectId(scheduleId) });

    res.json({ data: job.toJson(), success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const handleDeleteScheduleRoute = async (req: Request, res: Response) => {
  try {
    const walletAddress = getWalletAddressFromRequest(req);
    const { scheduleId } = req.params as { scheduleId: string };

    if (!walletAddress) {
      res.status(400).json({ error: 'No wallet address provided' });
      return;
    }

    await deleteSchedule({ scheduleId: new Types.ObjectId(scheduleId) });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
