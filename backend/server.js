const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('./models');
const { User } = require('./models');
const bcrypt = require('bcryptjs');
const authRoutes = require('./routes/auth');
const crudRoutes = require('./routes/crud');
const aiRoutes = require('./routes/ai');
const watchlistRoutes = require('./routes/watchlists');
const auth = require('./middleware/auth');
const { validateRuntime } = require('./governance/runtime');
const { createProviderGate } = require('./governance/providerGate');
const governanceRouter = require('./governance/router');

validateRuntime();

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(helmet());
const allowedOrigins=String(process.env.CORS_ORIGINS||CLIENT_URL).split(',').map(v=>v.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=>!origin||allowedOrigins.includes(origin)?cb(null,true):cb(new Error('Origin not allowed by CORS')),credentials:true}));
app.use(express.json({ limit: '10mb' }));
app.use(createProviderGate(['/api/ai','/api/gap']));

// Routes
app.use('/api/auth', authRoutes);
app.get('/api/health', (_req,res)=>res.json({status:'ok',timestamp:new Date().toISOString()}));
app.use('/api', auth);
app.use('/api', crudRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/governed-record-answers', governanceRouter);

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
    if (process.env.MIGRATE_ON_START === 'true') {
      await sequelize.sync({ alter: false });
      const email = process.env.PROVISION_ADMIN_EMAIL;
      const password = process.env.PROVISION_ADMIN_PASSWORD;
      if (!email || !password) throw new Error('runtime admin credentials are required');
      const passwordHash = await bcrypt.hash(password, 10);
      const existing = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existing) {
        await existing.update({ password: passwordHash, name: process.env.PROVISION_ADMIN_NAME || 'Runtime Admin', role: 'admin' }, { hooks: false });
      } else {
        await User.create({ email: email.toLowerCase(), password, name: process.env.PROVISION_ADMIN_NAME || 'Runtime Admin', role: 'admin' });
      }
      console.log('Database schema and runtime administrator initialized');
    }

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
