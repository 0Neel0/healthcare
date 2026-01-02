import express from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller.js';
import { upload } from '../middleware/upload.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', auth, upload.single('file'), sendMessage);
router.get('/:otherUserId', auth, getMessages);

export default router;
