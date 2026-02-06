import { Router } from 'express'
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController'
import { authenticateToken } from '../middlewares/authMiddleware'

const router = Router()

router.use(authenticateToken)

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
