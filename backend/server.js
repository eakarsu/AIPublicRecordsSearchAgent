const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const crudRoutes = require('./routes/crud');
const aiRoutes = require('./routes/ai');
const watchlistRoutes = require('./routes/watchlists');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', crudRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/watchlists', watchlistRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ alter: false });
    console.log('Models synchronized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

// AI feature mount: entity-resolution
app.use('/api/ai/entity-resolution', require('./routes/ai-entity-resolution'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-documentocr-extract-text-from-scanned-doc', require('./routes/gap-no-documentocr-extract-text-from-scanned-doc'));
app.use('/api/gap-no-personnetworkmap-entity-connection-graph', require('./routes/gap-no-personnetworkmap-entity-connection-graph'));
app.use('/api/gap-no-timelinereconstruction-chronological-narr', require('./routes/gap-no-timelinereconstruction-chronological-narr'));
app.use('/api/gap-no-contradictiondetection-crossdocument-inco', require('./routes/gap-no-contradictiondetection-crossdocument-inco'));
app.use('/api/gap-no-imagehandwriting-recognition-pipeline', require('./routes/gap-no-imagehandwriting-recognition-pipeline'));
app.use('/api/gap-no-savedsearch-alert-delivery-notifications', require('./routes/gap-no-savedsearch-alert-delivery-notifications'));
app.use('/api/gap-no-bulk-downloadexport-of-results', require('./routes/gap-no-bulk-downloadexport-of-results'));
app.use('/api/gap-no-external-datasource-integrations-court-do', require('./routes/gap-no-external-datasource-integrations-court-do'));
app.use('/api/gap-no-foia-request-deadline-tracking', require('./routes/gap-no-foia-request-deadline-tracking'));
app.use('/api/gap-no-organizationteam-workspace-management', require('./routes/gap-no-organizationteam-workspace-management'));
app.use('/api/gap-no-audit-log-of-who-searched-what-piisensiti', require('./routes/gap-no-audit-log-of-who-searched-what-piisensiti'));
app.use('/api/gap-no-file-upload-route-for-usersupplied-pdfs', require('./routes/gap-no-file-upload-route-for-usersupplied-pdfs'));
// === End Batch 07 ===
