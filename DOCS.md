# Documentation Guide

This project uses [docs.page](https://use.docs.page/) for documentation hosting. Here's how to access and work with the documentation:

## Accessing the Documentation

### Online (Recommended)
Once this repository is public on GitHub, you can access the documentation at:
```
https://use.docs.page/abdullahaltun70/animation-playground
```

### Alternative Access Methods

1. **docs.page website**: Go to [use.docs.page](https://use.docs.page/) and enter the repository URL
2. **GitHub integration**: docs.page automatically detects and builds documentation from repositories with `docs.json` configuration

## Local Development

For local documentation development, you can:

1. **Edit markdown files** directly in the `docs/` folder
2. **Preview changes** by committing to GitHub and viewing on docs.page
3. **Use any markdown editor** with live preview for content editing

## Documentation Structure

```
docs/
├── docs.json              # Configuration file
├── index.mdx             # Homepage
├── features.mdx          # Features overview
├── setup.mdx             # Quick start guide
├── available-scripts.mdx # Available scripts
├── core-technologies.mdx # Tech stack
├── guide/                # User guides
│   ├── creating-animations.mdx
│   ├── sharing-exporting.mdx
│   └── user-accounts.mdx
└── development/          # Developer docs
    ├── project-structure.mdx
    ├── testing.mdx
    └── contributing.mdx
```

## Troubleshooting

If you encounter errors when viewing the documentation:

1. **405 Method Not Allowed**: This usually happens when trying to access docs.page incorrectly. Use the official URL format above.
2. **Missing pages**: Ensure all referenced pages in `docs.json` exist in the `docs/` folder.
3. **Configuration errors**: Validate your `docs.json` syntax using a JSON validator.

## Making Changes

1. Edit the relevant `.mdx` file in the `docs/` folder
2. Commit and push your changes to GitHub
3. The documentation will automatically update on docs.page

For configuration changes, edit `docs.json` and follow the same process.
