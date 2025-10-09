const express = require('express');
const router = express.Router();
const { db, characters, projects } = require('../db');
const { eq, and } = require('drizzle-orm');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper function to verify project ownership
async function verifyProjectOwnership(projectId, userId) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  return project;
}

// GET /characters/project/:projectId - Get all characters for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, req.user.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const projectCharacters = await db
      .select()
      .from(characters)
      .where(eq(characters.projectId, projectId));

    res.json(projectCharacters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// GET /characters/:id - Get a specific character
router.get('/:id', async (req, res) => {
  try {
    const characterId = parseInt(req.params.id);
    
    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Verify project ownership
    const project = await verifyProjectOwnership(character.projectId, req.user.id);
    if (!project) {
      return res.status(404).json({ error: 'Character not found or access denied' });
    }

    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// POST /characters - Create a new character
router.post('/', async (req, res) => {
  try {
    const { name, description, traits = [], backstory, relationships = [], avatar, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ error: 'Name and projectId are required' });
    }

    // Verify project ownership
    const project = await verifyProjectOwnership(projectId, req.user.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const [newCharacter] = await db
      .insert(characters)
      .values({
        name,
        description,
        traits,
        backstory,
        relationships,
        avatar,
        projectId,
      })
      .returning();

    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// PUT /characters/:id - Update a character
router.put('/:id', async (req, res) => {
  try {
    const characterId = parseInt(req.params.id);
    const { name, description, traits, backstory, relationships, avatar } = req.body;

    // Get the character and verify ownership
    const [existingCharacter] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);

    if (!existingCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Verify project ownership
    const project = await verifyProjectOwnership(existingCharacter.projectId, req.user.id);
    if (!project) {
      return res.status(404).json({ error: 'Character not found or access denied' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (traits !== undefined) updateData.traits = traits;
    if (backstory !== undefined) updateData.backstory = backstory;
    if (relationships !== undefined) updateData.relationships = relationships;
    if (avatar !== undefined) updateData.avatar = avatar;
    updateData.updatedAt = new Date();

    const [updatedCharacter] = await db
      .update(characters)
      .set(updateData)
      .where(eq(characters.id, characterId))
      .returning();

    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// DELETE /characters/:id - Delete a character
router.delete('/:id', async (req, res) => {
  try {
    const characterId = parseInt(req.params.id);

    // Get the character and verify ownership
    const [existingCharacter] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);

    if (!existingCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Verify project ownership
    const project = await verifyProjectOwnership(existingCharacter.projectId, req.user.id);
    if (!project) {
      return res.status(404).json({ error: 'Character not found or access denied' });
    }

    await db.delete(characters).where(eq(characters.id, characterId));

    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

module.exports = router;