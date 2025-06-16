import { Router } from 'express';
import { themes } from '../data/themes';
import { ApiResponse } from '../../../shared/types';

const router = Router();

// Get all themes
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: themes
  } as ApiResponse<typeof themes>);
});

// Get theme by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const theme = themes.find(t => t.id === id);
  
  if (!theme) {
    return res.status(404).json({
      success: false,
      error: 'Theme not found'
    } as ApiResponse<null>);
  }

  res.json({
    success: true,
    data: theme
  } as ApiResponse<typeof theme>);
});

export default router;