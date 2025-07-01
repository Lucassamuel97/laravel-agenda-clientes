import { Request, Response } from 'express';
import Prometheus from 'prom-client';
export declare function metrics(req: Request, res: Response): Promise<void>;
export declare const prometheusRegister: Prometheus.Registry;
