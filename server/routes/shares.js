const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const { db, projectShares, projects, chapters, users } = require('../db');
const { eq, and } = require('drizzle-orm');

// Middleware to verify authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create a shareable link for a project (read-only)
router.post('/:projectId/share', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { accessType = 'read', expiresIn } = req.body; // expiresIn in days

    // Check if user owns the project or is a collaborator with write access
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .limit(1);

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = project[0];
    const hasWriteAccess = projectData.userId === req.user.id || 
      (projectData.collaborators && projectData.collaborators.some(collab => 
        collab.email === req.user.email && collab.permission === 'write'
      ));

    if (!hasWriteAccess) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString('hex');
    
    // Calculate expiration date if provided
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    }

    // Create share record
    const shareRecord = await db
      .insert(projectShares)
      .values({
        projectId: parseInt(projectId),
        shareToken: shareToken,
        accessType: accessType,
        createdBy: req.user.id,
        expiresAt: expiresAt,
      })
      .returning();

    // Generate shareable URL
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${shareToken}`;

    res.status(201).json({
      shareUrl,
      shareToken,
      accessType,
      expiresAt,
      share: shareRecord[0]
    });
  } catch (error) {
    console.error('Error creating project share:', error);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

// Get project by share token (public access)
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    // Find valid share record
    const share = await db
      .select()
      .from(projectShares)
      .where(eq(projectShares.shareToken, shareToken))
      .limit(1);

    if (share.length === 0) {
      return res.status(404).json({ error: 'Share link not found or expired' });
    }

    const shareData = share[0];

    // Check if share has expired
    if (shareData.expiresAt && new Date() > shareData.expiresAt) {
      return res.status(404).json({ error: 'Share link has expired' });
    }

    // Get project details
    const project = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        genre: projects.genre,
        wordCount: projects.wordCount,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(eq(projects.id, shareData.projectId))
      .limit(1);

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get chapters (read-only)
    const projectChapters = await db
      .select({
        id: chapters.id,
        title: chapters.title,
        content: chapters.content,
        order: chapters.order,
        wordCount: chapters.wordCount,
        createdAt: chapters.createdAt,
        updatedAt: chapters.updatedAt,
      })
      .from(chapters)
      .where(eq(chapters.projectId, shareData.projectId))
      .orderBy(chapters.order);

    res.json({
      project: project[0],
      chapters: projectChapters,
      accessType: shareData.accessType,
      isSharedView: true
    });
  } catch (error) {
    console.error('Error fetching shared project:', error);
    res.status(500).json({ error: 'Failed to load shared project' });
  }
});

// Get all shares for a project
router.get('/:projectId/shares', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if user owns the project
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .limit(1);

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = project[0];
    if (projectData.userId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Get all shares for this project
    const shares = await db
      .select()
      .from(projectShares)
      .where(eq(projectShares.projectId, parseInt(projectId)));

    // Add share URLs
    const sharesWithUrls = shares.map(share => ({
      ...share,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${share.shareToken}`,
      isExpired: share.expiresAt && new Date() > share.expiresAt
    }));

    res.json(sharesWithUrls);
  } catch (error) {
    console.error('Error fetching project shares:', error);
    res.status(500).json({ error: 'Failed to fetch shares' });
  }
});

// Delete a share link
router.delete('/:projectId/shares/:shareId', authenticateToken, async (req, res) => {
  try {
    const { projectId, shareId } = req.params;

    // Check if user owns the project
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .limit(1);

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = project[0];
    if (projectData.userId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Delete the share
    await db
      .delete(projectShares)
      .where(and(
        eq(projectShares.id, parseInt(shareId)),
        eq(projectShares.projectId, parseInt(projectId))
      ));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project share:', error);
    res.status(500).json({ error: 'Failed to delete share' });
  }
});

module.exports = router;