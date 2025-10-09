const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { db, chatMessages, users, projects } = require('../db');
const { eq, and, desc, isNull, or, sql } = require('drizzle-orm');

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

// Get chat messages for a project
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { chapterId } = req.query; // Optional - for chapter-specific chat

    // Check if user has access to this project (either owner or collaborator)
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, parseInt(projectId)),
          or(
            eq(projects.userId, req.user.id), // User is the owner
            sql`${projects.collaborators}::jsonb @> ${JSON.stringify([req.user.email])}::jsonb` // User is a collaborator
          )
        )
      )
      .limit(1);

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // Build query conditions
    const conditions = [eq(chatMessages.projectId, parseInt(projectId))];
    if (chapterId) {
      conditions.push(eq(chatMessages.chapterId, parseInt(chapterId)));
    } else {
      // For general project chat, get messages with no chapter ID
      conditions.push(isNull(chatMessages.chapterId));
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(and(...conditions))
      .orderBy(desc(chatMessages.createdAt))
      .limit(100); // Get last 100 messages

    // Reverse to show oldest first
    messages.reverse();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Send a new chat message
router.post('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, chapterId, messageType = 'text' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if user has access to this project (either owner or collaborator)
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, parseInt(projectId)),
          or(
            eq(projects.userId, req.user.id), // User is the owner
            sql`${projects.collaborators}::jsonb @> ${JSON.stringify([req.user.email])}::jsonb` // User is a collaborator
          )
        )
      )
      .limit(1);

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // Get user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user[0];

    // Insert new message
    const newMessage = await db
      .insert(chatMessages)
      .values({
        projectId: parseInt(projectId),
        chapterId: chapterId ? parseInt(chapterId) : null,
        userId: req.user.id,
        userEmail: userData.email,
        userName: userData.name,
        message: message.trim(),
        messageType: messageType,
      })
      .returning();

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete a chat message (only the sender or project owner can delete)
router.delete('/:projectId/:messageId', authenticateToken, async (req, res) => {
  try {
    const { projectId, messageId } = req.params;

    // Get the message to check ownership
    const message = await db
      .select()
      .from(chatMessages)
      .where(and(
        eq(chatMessages.id, parseInt(messageId)),
        eq(chatMessages.projectId, parseInt(projectId))
      ))
      .limit(1);

    if (message.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const messageData = message[0];

    // Get project details to check if user is owner
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectId)))
      .limit(1);

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = project[0];

    // Check if user can delete (message sender or project owner)
    const canDelete = messageData.userId === req.user.id || projectData.userId === req.user.id;

    if (!canDelete) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Delete the message
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.id, parseInt(messageId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;