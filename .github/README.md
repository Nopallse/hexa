# CI/CD Setup Documentation

This repository uses GitHub Actions for automated testing and deployment.

## Workflows

### 1. `deploy.yml` - Production Deployment
**Trigger:** Push to `main` branch or manual trigger

**Jobs:**
- **Test**: Runs tests and builds the application
- **Deploy**: Deploys to production server via SSH
- **Notify**: Sends deployment status notifications

### 2. `ci.yml` - Pull Request Checks
**Trigger:** Pull requests to `main`/`develop` branches, push to `develop`

**Jobs:**
- **Quality Checks**: Linting, building, syntax validation
- **Security Scan**: Dependency vulnerability scanning
- **Environment Validation**: Validates configuration files

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

### Server Connection Secrets
```
SERVER_HOST        # Your server IP address or domain
SERVER_USER        # SSH username (e.g., 'ubuntu', 'root')
SERVER_SSH_KEY     # Private SSH key content
```

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the required secrets:

### SERVER_HOST
```
# Example values:
192.168.1.100
your-domain.com
```

### SERVER_USER
```
# Example values:
ubuntu
root
deploy
```

### SERVER_SSH_KEY
```
# Your private SSH key content, should look like:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtcn
...
-----END OPENSSH PRIVATE KEY-----
```

## Server Prerequisites

Your production server should have:

1. **Node.js 18+** installed
2. **PM2** installed globally: `npm install -g pm2`
3. **Git** repository cloned at `/path/to/hexa`
4. **SSH access** configured for the deployment user
5. **Project dependencies** initially installed

### Initial Server Setup Commands
```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/Nopallse/hexa.git
cd hexa

# Initial setup
cd fe && npm ci && npm run build
cd ../be && npm ci --production

# Start with PM2
pm2 start src/server.js --name "hexa-api"
pm2 startup
pm2 save
```

## Deployment Process

When you push to the `main` branch:

1. **Tests run** on GitHub runners
2. **Frontend builds** to verify no build errors
3. **SSH connection** to your server
4. **Git pull** latest changes
5. **Frontend rebuild** with latest code
6. **Backend dependencies** updated (production only)
7. **PM2 restart** to apply changes
8. **Status notification** sent

## Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Choose the branch (usually `main`)
5. Click **Run workflow**

## Troubleshooting

### Common Issues:

**SSH Connection Fails:**
- Check `SERVER_HOST`, `SERVER_USER`, and `SERVER_SSH_KEY` secrets
- Ensure SSH key has proper permissions on server
- Verify server allows SSH connections

**Build Fails:**
- Check if Node.js version matches (18+)
- Verify all dependencies are properly listed in package.json
- Check for syntax errors in code

**PM2 Restart Fails:**
- Ensure PM2 is installed globally on server
- Check if PM2 processes exist: `pm2 list`
- Verify server has enough memory/resources

**Git Pull Fails:**
- Check if repository exists on server
- Verify git remote origin is set correctly
- Ensure deploy user has git access permissions

### Manual Server Debug:
```bash
# Check PM2 status
pm2 status
pm2 logs

# Check application logs
cd hexa/be
npm start  # Test if app starts manually

# Check git status
git status
git remote -v
```

## Environment Variables

Make sure your production server has the required environment variables:

**Backend (.env):**
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3000
```

**Frontend (if needed):**
```
VITE_API_URL=http://your-server:3000
```

## Security Considerations

1. **SSH Keys**: Use dedicated SSH keys for deployment
2. **Server Access**: Limit SSH access to deployment user only
3. **Secrets**: Never commit secrets to repository
4. **Database**: Ensure database is properly secured
5. **Firewall**: Configure server firewall appropriately

## Monitoring

After deployment, monitor:
- PM2 process status: `pm2 monit`
- Application logs: `pm2 logs`
- Server resources: `htop`, `df -h`
- Application health: Test key endpoints