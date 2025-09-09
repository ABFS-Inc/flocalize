
# Flocalize Project – Agent Configuration

## Agent Behavior
- Professional, fact-based, concise, production-ready code
- See `instructions.md` for coding standards, testing, and workflow

## Code Quality Standards
- **NO FALLBACKS**: Write clean, great code that works correctly the first time
- **NO TRY-CATCH WORKAROUNDS**: Fix the root cause, don't mask errors with fallbacks
- **PROPER API USAGE**: Use APIs correctly according to their latest documentation
- **CLEAN ARCHITECTURE**: Each function should have one clear purpose and work reliably

## Key Principles
- DRY: No code or info duplication; use imports and references
- KISS: Keep it simple and straightforward
- YAGNI: Only implement what is necessary now; avoid over-engineering
- PEP8: Follow Python style guidelines for readability and consistency
- Pythonic: Write idiomatic Python code
- Elegant: Strive for clean, efficient, and maintainable solutions, with the smallest possible codebase
- Modular: Break code into reusable, single-purpose functions and classes, within a clear and small files
- PowerShell only for all commands
- Always activate `flocalize_env` before running code
- Use Windows-style paths

## File Operations
- Use relative paths, handle Windows separators, add error handling

## Windows Focus
- Use PowerShell for automation, consider Windows service patterns

## Libraries & Tools
- See `instructions.md` for all defaults, security, and workflow

## Known issues and limitations, and how to handle them
- Sending commands to the PowerShell terminal may sometimes not show you the output because you are checking before the command has finished executing. Always wait a few seconds after sending a command before checking the output. In case you cannot see the output of a command, try searching for the expected output in the terminal text.
---

*Configuration Version: 1.1*
*Last Updated: August 25, 2025*
