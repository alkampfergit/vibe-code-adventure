import { Router } from 'express'
import { GameController } from '../controllers/GameController.js'

const router = Router()

router.post('/character', GameController.createCharacter)
router.get('/state/:userId', GameController.getGameState)
router.post('/save', GameController.saveGame)
router.post('/command', GameController.executeCommand)

export default router