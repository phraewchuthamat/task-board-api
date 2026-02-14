import { Router } from 'express'
import {
    getColumns,
    createColumn,
    updateColumn,
    deleteColumn,
} from '../controllers/columnController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'

const router = Router()

router.use(authenticateToken)

router.get('/', getColumns)
router.post('/', createColumn)
router.patch('/:id', updateColumn)
router.delete('/:id', deleteColumn)

export default router
