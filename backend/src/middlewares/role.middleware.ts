import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Tidak terautentikasi." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk aksi ini.`,
      });
      return;
    }

    next();
  };
};
