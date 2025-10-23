const express = require('express');
const router = express.Router();
const { db, worldElements, projects } = require('../db');
const { eq, and, or, sql } = require('drizzle-orm');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper: verify project access (owner OR collaborator)
async function verifyProjectAccess(projectId, userId, userEmail) {
  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        or(
          eq(projects.userId, userId),
          sql`${projects.collaborators}::jsonb @> ${JSON.stringify([userEmail])}::jsonb`
        )
      )
    )
    .limit(1);
  return project;
}

// Valid world element types
const VALID_TYPES = ['location', 'organization', 'magic-system', 'culture', 'technology'];

// GET /world-elements/project/:projectId - Get all world elements for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { type } = req.query;
    
  // Verify project access (owner or collaborator)
  const project = await verifyProjectAccess(projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    let query = db
      .select()
      .from(worldElements)
      .where(eq(worldElements.projectId, projectId));

    // Filter by type if provided
    if (type && VALID_TYPES.includes(type)) {
      query = query.where(and(
        eq(worldElements.projectId, projectId),
        eq(worldElements.type, type)
      ));
    }

    const elements = await query;

    res.json(elements);
  } catch (error) {
    console.error('Error fetching world elements:', error);
    res.status(500).json({ error: 'Failed to fetch world elements' });
  }
});

// GET /world-elements/:id - Get a specific world element
router.get('/:id', async (req, res) => {
  try {
    const elementId = parseInt(req.params.id);
    
    const [element] = await db
      .select()
      .from(worldElements)
      .where(eq(worldElements.id, elementId))
      .limit(1);

    if (!element) {
      return res.status(404).json({ error: 'World element not found' });
    }

  // Verify project access (owner or collaborator)
  const project = await verifyProjectAccess(element.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'World element not found or access denied' });
    }

    res.json(element);
  } catch (error) {
    console.error('Error fetching world element:', error);
    res.status(500).json({ error: 'Failed to fetch world element' });
  }
});

// POST /world-elements - Create a new world element
router.post('/', async (req, res) => {
  try {
    const { name, type, description, details = {}, projectId } = req.body;

    if (!name || !type || !projectId) {
      return res.status(400).json({ error: 'Name, type, and projectId are required' });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ 
        error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` 
      });
    }

  // Verify project access (owner or collaborator)
  const project = await verifyProjectAccess(projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const [newElement] = await db
      .insert(worldElements)
      .values({
        name,
        type,
        description,
        details,
        projectId,
      })
      .returning();

    res.status(201).json(newElement);
  } catch (error) {
    console.error('Error creating world element:', error);
    res.status(500).json({ error: 'Failed to create world element' });
  }
});

// PUT /world-elements/:id - Update a world element
router.put('/:id', async (req, res) => {
  try {
    const elementId = parseInt(req.params.id);
    const { name, type, description, details } = req.body;

    // Get the element and verify ownership
    const [existingElement] = await db
      .select()
      .from(worldElements)
      .where(eq(worldElements.id, elementId))
      .limit(1);

    if (!existingElement) {
      return res.status(404).json({ error: 'World element not found' });
    }

  // Verify project access (owner or collaborator)
  const project = await verifyProjectAccess(existingElement.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'World element not found or access denied' });
    }

    // Validate type if provided
    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ 
        error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` 
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (details !== undefined) updateData.details = details;
    updateData.updatedAt = new Date();

    const [updatedElement] = await db
      .update(worldElements)
      .set(updateData)
      .where(eq(worldElements.id, elementId))
      .returning();

    res.json(updatedElement);
  } catch (error) {
    console.error('Error updating world element:', error);
    res.status(500).json({ error: 'Failed to update world element' });
  }
});

// DELETE /world-elements/:id - Delete a world element
router.delete('/:id', async (req, res) => {
  try {
    const elementId = parseInt(req.params.id);

    // Get the element and verify ownership
    const [existingElement] = await db
      .select()
      .from(worldElements)
      .where(eq(worldElements.id, elementId))
      .limit(1);

    if (!existingElement) {
      return res.status(404).json({ error: 'World element not found' });
    }

  // Verify project access (owner or collaborator)
  const project = await verifyProjectAccess(existingElement.projectId, req.user.id, req.user.email);
    if (!project) {
      return res.status(404).json({ error: 'World element not found or access denied' });
    }

    await db.delete(worldElements).where(eq(worldElements.id, elementId));

    res.json({ message: 'World element deleted successfully' });
  } catch (error) {
    console.error('Error deleting world element:', error);
    res.status(500).json({ error: 'Failed to delete world element' });
  }
});

// GET /world-elements/types - Get valid world element types
router.get('/types', (req, res) => {
  res.json(VALID_TYPES);
});

module.exports = router;