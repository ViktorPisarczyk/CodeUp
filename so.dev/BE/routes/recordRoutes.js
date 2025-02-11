import { Router } from 'express';

import {
  getSingleRecord,
  getRecords,
  createRecord,
    updateRecord,
    deleteRecord,
    seedRecords
 
} from '../controllers/recordController.js';
import { seedRecords } from '../controllers/recordController.js';
import { restrictTo,protect } from '../middlewares/auth.js';

export const recordRouter = Router();

recordRouter.route('/').get(protect,restrictTo('admin','customer'),getRecords);
recordRouter.route('/:id').get(protect,getSingleRecord);
recordRouter.route('/').post(protect,restrictTo('admin') ,createRecord);
recordRouter.route('/:id')
.patch(protect,restrictTo('admin','customer'),updateRecord)
.delete(protect,restrictTo('admin','customer'),deleteRecord);

recordRouter.route('/seed').post(protect,restrictTo('admin'),seedRecords);