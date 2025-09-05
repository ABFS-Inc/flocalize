
# Flocalize - Localize where your crowd is flocking to – Development Instructions

## Key Technologies & Environment
- Python 3.12.9 backend, HTML/CSS/JavaScript frontend, Chrome Extension (Manifest V3)
- Conda environment: `flocalize_env`
- Deployment: Windows Server 2022 (AWS EC2 VPS)
- AI/ML: Grok 4 for content creation, Gemini 2.5 Flash for Instagram action decisions


## Coding & Documentation Standards
- Follow PEP 8, use type hints, f-strings, and modular design (see `agent-config.md` for details)
- Frontend: Use semantic HTML5, modern CSS, ES6+ JavaScript
- Chrome Extension: Manifest V3, minimal permissions, secure and efficient
- No docstrings or code comments; code should be self-explanatory
- Update `README.md` for new features


## Development Workflow
- Use PowerShell only for all commands
- Always activate `flocalize_env` before running code
- Use conda for package management (pip only if necessary)
- Use Windows-style paths
- For agent/terminal settings, see `agent-config.md`


## Code Quality
- Type hints, error handling, logging, Black formatter (88 chars)
- Unit tests and edge case testing (pytest)
- See `agent-config.md` for agent-specific behavior


## Testing Guidelines
- Write unit and integration tests for all code (see `project-context.md` for folder structure)
- Use Jest/Vitest for frontend, Playwright for E2E, pytest for backend
- Use GitHub Actions for CI/CD
- See `project-context.md` for test setup details

## Deployment
- Backend: Windows Server 2022 (AWS EC2 VPS)
- Frontend: Serve static files from any web server
- Chrome Extension: Package for Chrome Web Store or private use


## Security & Config
- Never hardcode API keys; rotate keys regularly
- Use HTTPS, encrypt sensitive data, follow privacy regulations
- Store secrets in config files in AppData (see `project-context.md`)
- Use Python logging, Black formatter, pytest


## Troubleshooting
- Check logs for errors, reproduce issues locally, use debugging tools
- See `project-context.md` for logging locations


## Before Coding
- Is it scalable, tested, and documented?
- Does it follow coding standards? (see `agent-config.md`)

---

*Last updated: August 25, 2025*
*Version: 1.1*
